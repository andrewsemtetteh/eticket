import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('🔍 Login attempt:', { email, passwordLength: password?.length });

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find admin user
    console.log('🔍 Searching for user in database...');
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_admin', true)
      .single();

    console.log('🔍 Database query result:', { 
      user: user ? { id: user.id, email: user.email, name: user.name, is_admin: user.is_admin } : null, 
      error: error?.message 
    });

    if (error || !user) {
      console.log('❌ User not found or not admin');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // For demo purposes, we'll use a simple password check
    // In production, you should hash passwords properly
    const expectedPassword = 'oraduku@2026!';
    const isValidPassword = password === expectedPassword;
    
    console.log('🔍 Password check:', { 
      provided: password, 
      expected: expectedPassword, 
      match: isValidPassword 
    });

    if (!isValidPassword) {
      console.log('❌ Password mismatch');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('✅ Authentication successful');

    // Generate JWT token
    const token = generateToken(user);

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_admin: user.is_admin,
      }
    });

    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    console.log('🍪 Cookie set:', { 
      tokenLength: token.length,
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      }
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
