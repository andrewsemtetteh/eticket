import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get the admin token from cookies
    const token = request.cookies.get('admin-token')?.value;
    
    console.log('🔍 Auth Verify - Token check:', { 
      hasToken: !!token, 
      tokenLength: token?.length 
    });

    if (!token) {
      console.log('❌ Auth Verify - No token found');
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify the token
    const user = verifyToken(token);
    
    console.log('🔍 Auth Verify - Token verification:', { 
      user: user ? { id: user.id, email: user.email, is_admin: user.is_admin } : null 
    });

    if (!user || !user.is_admin) {
      console.log('❌ Auth Verify - Invalid user or not admin');
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    console.log('✅ Auth Verify - Authentication successful');
    return NextResponse.json({ 
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_admin: user.is_admin
      }
    });

  } catch (error) {
    console.error('Auth verify error:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
