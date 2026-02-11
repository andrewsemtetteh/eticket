import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: AdminUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      is_admin: user.is_admin,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AdminUser | null {
  try {
    console.log('🔍 JWT Verify - Input:', { 
      tokenLength: token?.length, 
      tokenStart: token?.substring(0, 20) + '...',
      jwtSecret: JWT_SECRET?.substring(0, 10) + '...'
    });
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('✅ JWT Verify - Success:', { 
      id: decoded.id, 
      email: decoded.email, 
      is_admin: decoded.is_admin 
    });
    
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      is_admin: decoded.is_admin,
    };
  } catch (error) {
    console.log('❌ JWT Verify - Error:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}
