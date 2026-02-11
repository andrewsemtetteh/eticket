import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Debug endpoint called');
    
    // Check environment variables
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      jwtSecret: !!process.env.JWT_SECRET,
      paystackPublic: !!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      paystackSecret: !!process.env.PAYSTACK_SECRET_KEY,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      nodeEnv: process.env.NODE_ENV,
      smtpHost: !!process.env.SMTP_HOST,
      smtpUser: !!process.env.SMTP_USER,
      smtpPass: !!process.env.SMTP_PASS
    };

    console.log('🔍 Environment variables:', envCheck);

    // Test database connection
    const { data: testQuery, error: testError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    console.log('🔍 Database test:', { testQuery, testError });

    // Check for admin users
    const { data: adminUsers, error: adminError } = await supabaseAdmin
      .from('users')
      .select('email, is_admin')
      .eq('is_admin', true);

    console.log('🔍 Admin users:', { adminUsers, adminError });

    return NextResponse.json({
      success: true,
      environment: envCheck,
      database: {
        connected: !testError,
        error: testError?.message,
        adminUsers: adminUsers?.length || 0,
        adminEmails: adminUsers?.map(u => u.email) || []
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
