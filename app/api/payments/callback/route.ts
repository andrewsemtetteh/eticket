import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reference = searchParams.get('reference');
  const trxref = searchParams.get('trxref');
  
  // Redirect to confirmation page with reference
  const redirectUrl = new URL('/confirmation', request.url);
  if (reference || trxref) {
    redirectUrl.searchParams.set('reference', reference || trxref || '');
  }
  
  return NextResponse.redirect(redirectUrl);
}
