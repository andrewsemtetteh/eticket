import { NextRequest, NextResponse } from 'next/server';
import { sendTicketEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Test email data for Andrew with dark ticket design
    const emailData = {
      customerName: 'Andrew Sem Etteh',
      customerEmail: 'andrewsemtetteh@gmail.com',
      customerPhone: '0551234572',
      ticketId: 'TKT-1771251477-005',
      ticketType: 'early_bird' as const,
      quantity: 2,
      totalAmount: 400,
      currency: 'GHS',
      eventTitle: 'Sitting with the Silence After the Noise',
      eventDate: 'April 25, 2026',
      eventTime: '6:00 PM',
      venueName: 'Oraduku Event Center',
      venueAddress: 'Accra, Ghana',
      paymentReference: 'OD_1771251477077_9CZG8Y',
      purchaseDate: new Date().toLocaleString(),
    };

    const adminEmails = ['support@oraduku.com'];

    console.log('📧 Sending dark ticket design to andrewsemtetteh@gmail.com...');
    const result = await sendTicketEmail(emailData, adminEmails);
    
    return NextResponse.json({
      success: true,
      message: 'Dark ticket design sent successfully to andrewsemtetteh@gmail.com',
      result: result
    });

  } catch (error) {
    console.error('❌ Dark ticket email failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
