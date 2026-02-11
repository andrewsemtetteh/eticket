import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { PaystackService, generatePaymentReference } from '@/lib/paystack';

const paystack = new PaystackService(process.env.PAYSTACK_SECRET_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { email, name, phone, ticketType, quantity, amount } = await request.json();

    console.log('💳 Payment initialization:', { 
      email, 
      ticketType, 
      quantity, 
      amount,
      hasPaystackKey: !!process.env.PAYSTACK_SECRET_KEY,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL
    });

    if (!email || !name || !ticketType || !quantity || !amount) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check environment variables
    if (!process.env.PAYSTACK_SECRET_KEY || !process.env.NEXT_PUBLIC_BASE_URL) {
      console.log('❌ Missing payment environment variables');
      return NextResponse.json(
        { error: 'Payment service configuration error' },
        { status: 500 }
      );
    }

    // Create or find user
    let { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user) {
      const { data: newUser, error: userError } = await supabaseAdmin
        .from('users')
        .insert([{
          email,
          name,
          phone,
        }])
        .select()
        .single();

      if (userError) {
        throw userError;
      }
      user = newUser;
    }

    // Generate payment reference
    const reference = generatePaymentReference();

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert([{
        reference,
        amount,
        currency: 'GHS',
        status: 'pending',
        payment_method: 'card',
        user_id: user.id,
      }])
      .select()
      .single();

    if (paymentError) {
      throw paymentError;
    }

    // Initialize Paystack transaction
    const paystackResponse = await paystack.initializeTransaction({
      email,
      amount,
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/callback`,
      cancel_action: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?cancelled=true&reference=${reference}`,
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
      metadata: {
        user_id: user.id,
        payment_id: payment.id,
        ticket_type: ticketType,
        quantity,
        cancel_action: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?cancelled=true&reference=${reference}`
      }
    });

    if (!paystackResponse.status) {
      return NextResponse.json(
        { error: 'Failed to initialize payment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      authorization_url: paystackResponse.data.authorization_url,
      access_code: paystackResponse.data.access_code,
      reference: paystackResponse.data.reference,
    });

  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
