import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { PaystackService } from '@/lib/paystack';
import { sendTicketEmail, sendPaymentFailedEmail } from '@/lib/email';

const paystack = new PaystackService(process.env.PAYSTACK_SECRET_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();

    console.log('🔍 Payment verification:', { 
      reference,
      hasPaystackKey: !!process.env.PAYSTACK_SECRET_KEY,
      hasSmtpConfig: !!process.env.SMTP_HOST
    });

    if (!reference) {
      console.log('❌ Missing payment reference');
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    // Check environment variables
    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.log('❌ Missing Paystack secret key');
      return NextResponse.json(
        { error: 'Payment service configuration error' },
        { status: 500 }
      );
    }

    // Verify payment with Paystack
    const verification = await paystack.verifyTransaction(reference);

    if (!verification.status) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    const paymentData = verification.data;

    // Find payment record
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('reference', reference)
      .single();

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    // Update payment status
    const { data: updatedPayment, error: updateError } = await supabaseAdmin
      .from('payments')
      .update({
        status: paymentData.status === 'success' ? 'success' : 'failed',
        paystack_ref: paymentData.reference,
      })
      .eq('reference', reference)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    if (paymentData.status === 'success') {
      // Create tickets
      const metadata = paymentData.metadata;
      const ticketType = metadata.ticket_type === 'early-bird' ? 'early_bird' : 'general';
      const quantity = parseInt(metadata.quantity);
      const price = paymentData.amount / 100; // Convert from kobo

      const tickets = [];
      for (let i = 0; i < quantity; i++) {
        const ticketId = `OD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        const { data: ticket, error: ticketError } = await supabaseAdmin
          .from('tickets')
          .insert([{
            ticket_id: ticketId,
            type: ticketType,
            quantity: 1,
            price: price / quantity,
            status: 'confirmed',
            qr_code: ticketId,
            user_id: payment.user_id,
            payment_id: payment.id,
          }])
          .select()
          .single();

        if (ticketError) {
          throw ticketError;
        }
        
        tickets.push(ticket);
      }

      // Get user and settings data in parallel for email
      const [userResult, settingsResult] = await Promise.all([
        supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', payment.user_id)
          .single(),
        supabaseAdmin
          .from('event_settings')
          .select('*')
          .single()
      ]);

      const user = userResult.data;
      const settings = settingsResult.data;

      // Send ticket confirmation emails
      if (user && settings && tickets.length > 0) {
        const emailData = {
          customerName: user.name,
          customerEmail: user.email,
          customerPhone: user.phone || '',
          ticketId: tickets.map(t => t.ticket_id).join(', '),
          ticketType: ticketType as 'early_bird' | 'general',
          quantity: quantity,
          totalAmount: price,
          currency: 'GHS',
          eventTitle: settings.event_title || 'Sitting with the Silence After the Noise',
          eventDate: settings.event_date || 'April 25, 2026',
          eventTime: settings.event_time || '5:00 PM',
          venueName: settings.venue_name || 'Oraduku Event Center',
          venueAddress: settings.venue_address || 'Accra, Ghana',
          paymentReference: reference,
          purchaseDate: new Date().toLocaleString(),
        };

        // Build admin recipient list from explicit settings first
        let adminEmails: string[] = [
          settings.admin_email_1,
          settings.admin_email_2,
          settings.admin_email_3,
        ].filter((email): email is string => !!email);

        // If no explicit admin emails are configured, fall back to all admin users
        if (adminEmails.length === 0) {
          const { data: adminUsers } = await supabaseAdmin
            .from('users')
            .select('email')
            .eq('role', 'admin');

          if (adminUsers) {
            adminEmails = adminUsers.map(u => u.email).filter(Boolean);
          }
        }

        // Send emails asynchronously (don't block response)
        sendTicketEmail(emailData, adminEmails).catch(err => {
          console.error('Failed to send ticket emails:', err);
        });
      }

      return NextResponse.json({
        success: true,
        payment: updatedPayment,
        tickets,
      });
    }

    // Payment failed - send failure notification
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', payment.user_id)
      .single();

    const { data: settings } = await supabaseAdmin
      .from('event_settings')
      .select('event_title')
      .single();

    if (user) {
      sendPaymentFailedEmail(
        user.email,
        user.name,
        settings?.event_title || 'Event',
        reference
      ).catch(err => {
        console.error('Failed to send payment failed email:', err);
      });
    }

    return NextResponse.json({
      success: false,
      payment: updatedPayment,
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
