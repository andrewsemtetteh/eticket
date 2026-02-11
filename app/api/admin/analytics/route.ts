import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('admin-token')?.value;
    console.log('🔍 Analytics API - Token check:', { 
      hasToken: !!token, 
      tokenLength: token?.length,
      allCookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value?.substring(0, 20) + '...']))
    });
    
    if (!token) {
      console.log('❌ Analytics API - No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    console.log('🔍 Analytics API - Token verification:', { 
      user: user ? { id: user.id, email: user.email, is_admin: user.is_admin } : null 
    });
    
    if (!user || !user.is_admin) {
      console.log('❌ Analytics API - Invalid user or not admin');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Analytics API - Authentication successful');

    // Get ticket statistics - only confirmed tickets (successful payments)
    const { data: tickets } = await supabaseAdmin
      .from('tickets')
      .select('type, quantity, status, price, created_at')
      .eq('status', 'confirmed');

    // Get payment statistics - only successful payments
    const { data: payments } = await supabaseAdmin
      .from('payments')
      .select('amount, status, created_at')
      .eq('status', 'success');

    const analytics = {
      tickets: {
        total: 0,
        confirmed: 0,
        earlyBird: 0,
        general: 0,
      },
      payments: {
        total: 0,
        totalRevenue: 0,
        successfulRevenue: 0,
      },
      recentActivity: [] as any[],
    };

    // Only count confirmed tickets (successful payments)
    if (tickets) {
      tickets.forEach((ticket: any) => {
        analytics.tickets.total += ticket.quantity;
        analytics.tickets.confirmed += ticket.quantity;

        if (ticket.type === 'early_bird') analytics.tickets.earlyBird += ticket.quantity;
        else analytics.tickets.general += ticket.quantity;
      });
    }

    // Only count successful payments
    if (payments) {
      payments.forEach((payment: any) => {
        analytics.payments.total++;
        analytics.payments.totalRevenue += payment.amount;
        analytics.payments.successfulRevenue += payment.amount;
      });
    }

    // Get recent activity (last 10 confirmed tickets and successful payments)
    const { data: recentTickets } = await supabaseAdmin
      .from('tickets')
      .select(`
        id, ticket_id, type, quantity, status, created_at,
        users!inner (name, email)
      `)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentPayments } = await supabaseAdmin
      .from('payments')
      .select(`
        id, reference, amount, status, created_at,
        users!inner (name, email)
      `)
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(5);

    analytics.recentActivity = [
      ...(recentTickets || []).map((ticket: any) => ({
        type: 'ticket',
        id: ticket.id,
        description: `${ticket.users?.name || 'Unknown'} - ${ticket.quantity}x ${ticket.type === 'early_bird' ? 'Early Bird' : 'General'}`,
        status: ticket.status,
        created_at: ticket.created_at,
      })),
      ...(recentPayments || []).map((payment: any) => ({
        type: 'payment',
        id: payment.id,
        description: `${payment.users?.name || 'Unknown'} - GHS ${payment.amount}`,
        status: payment.status,
        created_at: payment.created_at,
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);

    return NextResponse.json({ analytics });

  } catch (error) {
    console.error('Admin analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
