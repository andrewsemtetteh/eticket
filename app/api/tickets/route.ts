import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get('reference');
    const email = searchParams.get('email');

    if (reference) {
      const { data: payment } = await supabaseAdmin
        .from('payments')
        .select(`
          *,
          tickets (*),
          users (*)
        `)
        .eq('reference', reference)
        .single();

      if (!payment) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      return NextResponse.json({
        payment,
        tickets: payment.tickets,
        user: payment.users,
      });
    }

    if (email) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select(`
          *,
          tickets (*, payments (*))
        `)
        .eq('email', email)
        .single();

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({
        user,
        tickets: user.tickets,
      });
    }

    return NextResponse.json(
      { error: 'Reference or email parameter required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Tickets API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
