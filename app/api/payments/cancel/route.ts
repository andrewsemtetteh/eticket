import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

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

    // Only cancel if payment is still pending
    if (payment.status !== 'pending') {
      return NextResponse.json(
        { error: 'Payment cannot be cancelled - already processed' },
        { status: 400 }
      );
    }

    // Update payment status to cancelled
    const { data: updatedPayment, error: updateError } = await supabaseAdmin
      .from('payments')
      .update({ status: 'cancelled' })
      .eq('reference', reference)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Cancel any pending tickets associated with this payment
    await supabaseAdmin
      .from('tickets')
      .update({ status: 'cancelled' })
      .eq('payment_id', payment.id)
      .eq('status', 'pending');

    return NextResponse.json({
      success: true,
      message: 'Payment cancelled successfully',
      payment: updatedPayment,
    });

  } catch (error) {
    console.error('Payment cancellation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Handle Paystack redirect for cancelled payments
  const searchParams = request.nextUrl.searchParams;
  const reference = searchParams.get('reference');
  
  if (reference) {
    // Update payment status to cancelled
    await supabaseAdmin
      .from('payments')
      .update({ status: 'cancelled' })
      .eq('reference', reference)
      .eq('status', 'pending');
  }
  
  // Redirect to home page with cancelled status
  const redirectUrl = new URL('/', request.url);
  redirectUrl.searchParams.set('payment', 'cancelled');
  
  return NextResponse.redirect(redirectUrl);
}
