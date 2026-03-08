import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Load environment variables
config({ path: '.env.local' });
config({ path: '.env' });

// Validate required environment variables
const requiredEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SMTP_HOST'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Create Supabase client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Function to get the appropriate PDF ticket based on ticket type
const getTicketPDF = (ticketType: 'early_bird' | 'general'): Buffer => {
  const pdfPath = ticketType === 'early_bird' 
    ? path.join(process.cwd(), 'public', 'earlybirdTickets.pdf')
    : path.join(process.cwd(), 'public', 'latebirdTickets.pdf');
  
  try {
    const pdfBuffer = fs.readFileSync(pdfPath);
    return pdfBuffer;
  } catch (error) {
    console.error(`❌ Error reading PDF file: ${pdfPath}`, error);
    throw new Error(`Unable to read ticket PDF file for ${ticketType} ticket`);
  }
};

// Send ticket email function
const sendTicketEmail = async (data: any, adminEmails: string[]) => {
  try {
    const transporter = createTransporter();
    
    // Get the appropriate PDF ticket based on ticket type
    const pdfBuffer = getTicketPDF(data.ticketType);

    // Send email to customer with PDF attachment
    const customerMailOptions = {
      from: `${process.env.SMTP_FROM || process.env.SMTP_USER}`,
      to: data.customerEmail,
      subject: `Your Ticket Confirmation - ${data.eventTitle}`,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
    <h2 style="color: #000; margin-bottom: 20px; text-align: left;">Hello ${data.customerName},</h2>
    
    <p style="color: #000; margin-bottom: 20px; text-align: left;">
        The attached document is your purchased ticket for <strong>${data.eventTitle}</strong>.
    </p>
    
    <p style="color: #000; margin-bottom: 20px; text-align: left;">
        Your ticket is attached as a PDF file. Please download and save it. Bring it with you to the event.
    </p>
    
    <p style="color: #000; margin-bottom: 20px; text-align: left;">
        <strong>Location:</strong> Will be communicated 2 weeks before the event
    </p>
    
    <p style="color: #000; margin-bottom: 15px; text-align: left;">
        <strong>Ticket ID:</strong> ${data.ticketId}
    </p>
    
    <p style="color: #000; margin-bottom: 30px; text-align: left;">
        <strong>Payment Reference:</strong> ${data.paymentReference}
    </p>
    
    <p style="color: #000; margin-top: 30px; text-align: left;">
        Best regards,<br>
        <strong>The Orà duku Team</strong>
    </p>
</div>
      `,
      attachments: [
        {
          filename: `${data.ticketType === 'early_bird' ? 'earlybird' : 'latebird'}-ticket-${data.ticketId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(customerMailOptions);
    console.log(`✅ Ticket email with ${data.ticketType} PDF sent to customer: ${data.customerEmail}`);

    // Send notification emails to admins
    for (const adminEmail of adminEmails) {
      if (adminEmail && adminEmail !== 'admin1@example.com' && adminEmail !== 'admin2@example.com' && adminEmail !== 'admin3@example.com') {
        const adminMailOptions = {
          from: `${process.env.SMTP_FROM || process.env.SMTP_USER}`,
          to: adminEmail,
          subject: `New Ticket Purchase - ${data.customerName}`,
          html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
    <p style="color: #000; margin-bottom: 20px; text-align: left;">
        A new ticket has been purchased by <strong>${data.customerName}</strong> for <strong>${data.eventTitle}</strong>.
    </p>
    
    <div style="padding: 20px; margin: 20px 0;">
        <h3 style="color: #000; margin-top: 0; margin-bottom: 15px; text-align: left;">Purchase Details</h3>
        <p style="margin: 8px 0; color: #000; text-align: left;"><strong>Customer:</strong> ${data.customerName}</p>
        <p style="margin: 8px 0; color: #000; text-align: left;"><strong>Email:</strong> ${data.customerEmail}</p>
        <p style="margin: 8px 0; color: #000; text-align: left;"><strong>Phone:</strong> ${data.customerPhone}</p>
        <p style="margin: 8px 0; color: #000; text-align: left;"><strong>Event:</strong> ${data.eventTitle}</p>
        <p style="margin: 8px 0; color: #000; text-align: left;"><strong>Date:</strong> ${data.eventDate}</p>
        <p style="margin: 8px 0; color: #000; text-align: left;"><strong>Ticket Type:</strong> ${data.ticketType === 'early_bird' ? 'Early Bird' : 'General'}</p>
        <p style="margin: 8px 0; color: #000; text-align: left;"><strong>Quantity:</strong> ${data.quantity}</p>
        <p style="margin: 8px 0; color: #000; text-align: left;"><strong>Total Amount:</strong> ${data.currency} ${data.totalAmount.toFixed(2)}</p>
        <p style="margin: 8px 0; color: #000; text-align: left;"><strong>Ticket ID:</strong> ${data.ticketId}</p>
        <p style="margin: 8px 0; color: #000; text-align: left;"><strong>Payment Reference:</strong> ${data.paymentReference}</p>
    </div>
    
    <p style="color: #000; margin-top: 20px; text-align: left;">
        This is an automated notification. Please do not reply to this email.
    </p>
</div>
          `
        };

        await transporter.sendMail(adminMailOptions);
        console.log(`✅ Admin notification sent to: ${adminEmail}`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Error sending ticket email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

async function sendTodaysTickets() {
  try {
    console.log('🔄 Looking for today\'s ticket purchases...');

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Searching for purchases on: ${today}`);

    // Get all successful payments from today with associated tickets
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('payments')
      .select(`
        *,
        user:user_id (
          id,
          name,
          email,
          phone
        ),
        tickets!inner (
          ticket_id,
          type,
          quantity,
          price,
          status
        )
      `)
      .eq('status', 'success')
      .eq('tickets.status', 'confirmed')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lte('created_at', `${today}T23:59:59.999Z`)
      .order('created_at', { ascending: false });

    if (paymentsError) {
      console.error('❌ Error fetching payments:', paymentsError);
      process.exit(1);
    }

    if (!payments || payments.length === 0) {
      console.log('ℹ️ No successful payments found for today');
      process.exit(0);
    }

    console.log(`📊 Found ${payments.length} successful payments today`);

    // Get admin emails
    const { data: settings } = await supabaseAdmin
      .from('event_settings')
      .select('admin_email_1, admin_email_2, admin_email_3')
      .single();

    const adminEmails = [
      settings?.admin_email_1,
      settings?.admin_email_2,
      settings?.admin_email_3
    ].filter(email => email && email.trim() !== '');
    console.log(`📧 Will notify ${adminEmails.length} admin emails`);

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    // Process each payment
    for (const payment of payments) {
      try {
        if (!payment.user) {
          console.error(`❌ No user found for payment ${payment.reference}`);
          errorCount++;
          continue;
        }

        console.log(`👤 Processing: ${payment.user.name} (${payment.user.email})`);
        console.log(`💰 Amount: ${payment.currency} ${(payment.amount / 100).toFixed(2)}`);
        console.log(`🎫 Reference: ${payment.reference}`);

        // Group tickets by type
        const ticketGroups = payment.tickets.reduce((acc: any, ticket: any) => {
          if (!acc[ticket.type]) {
            acc[ticket.type] = [];
          }
          acc[ticket.type].push(ticket);
          return acc;
        }, {});

        // Send separate email for each ticket type
        for (const [ticketType, tickets] of Object.entries(ticketGroups)) {
          const ticketsOfThisType = tickets as any[];
          const totalQuantity = ticketsOfThisType.reduce((sum, ticket) => sum + ticket.quantity, 0);
          const totalPrice = ticketsOfThisType.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0);

          // Use the first ticket ID as reference
          const firstTicket = ticketsOfThisType[0];

          const emailData = {
            customerName: payment.user.name,
            customerEmail: payment.user.email,
            customerPhone: payment.user.phone || '',
            ticketId: firstTicket.ticket_id,
            ticketType: ticketType as 'early_bird' | 'general',
            quantity: totalQuantity,
            totalAmount: totalPrice,
            currency: 'GHS',
            eventTitle: 'Sitting with the Silence After the Noise',
            eventDate: 'April 25, 2026',
            eventTime: '5:00 PM',
            venueName: 'Oraduku Event Center',
            venueAddress: 'Accra, Ghana',
            paymentReference: payment.reference,
            purchaseDate: payment.created_at
          };

          console.log(`📧 Sending ${ticketType} ticket email...`);

          // Send email
          const emailResult = await sendTicketEmail(emailData, adminEmails);
          
          if (emailResult.success) {
            console.log(`✅ Email sent successfully to ${payment.user.email} for ${ticketType} tickets`);
            successCount++;
            results.push({
              email: payment.user.email,
              ticketType,
              ticketId: firstTicket.ticket_id,
              status: 'success'
            });
          } else {
            console.error(`❌ Failed to send email to ${payment.user.email}: ${emailResult.error}`);
            errorCount++;
            results.push({
              email: payment.user.email,
              ticketType,
              ticketId: firstTicket.ticket_id,
              status: 'failed',
              error: emailResult.error
            });
          }
        }
      } catch (error) {
        console.error(`❌ Error processing payment ${payment.reference}:`, error);
        errorCount++;
        results.push({
          email: payment.user?.email || 'unknown',
          paymentReference: payment.reference,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log('\n📈 === FINAL RESULTS ===');
    console.log(`✅ Successful emails: ${successCount}`);
    console.log(`❌ Failed emails: ${errorCount}`);
    console.log(`📊 Total processed: ${payments.length}`);
    
    if (errorCount > 0) {
      console.log('\n❌ Failed attempts:');
      results.filter(r => r.status === 'failed').forEach(result => {
        console.log(`  - ${result.email}: ${result.error || 'Unknown error'}`);
      });
    }

    console.log('\n🎉 Script completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
sendTodaysTickets().catch(console.error);
