import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if columns already exist by trying to select them
    const { data: existingSettings, error: checkError } = await supabaseAdmin
      .from('event_settings')
      .select('id, admin_email_1')
      .limit(1);

    // If admin_email_1 doesn't exist, we need to add the columns
    // Since Supabase doesn't support ALTER TABLE via the JS client directly,
    // we'll just update with the new fields - they'll be created if the table supports it
    // or we'll need to run the migration manually in Supabase dashboard

    if (checkError && checkError.message.includes('column')) {
      return NextResponse.json({
        success: false,
        message: 'Migration needed. Please run the following SQL in your Supabase dashboard:',
        sql: `
ALTER TABLE event_settings 
ADD COLUMN IF NOT EXISTS admin_email_1 VARCHAR(255) DEFAULT 'admin1@example.com',
ADD COLUMN IF NOT EXISTS admin_email_2 VARCHAR(255) DEFAULT 'admin2@example.com',
ADD COLUMN IF NOT EXISTS admin_email_3 VARCHAR(255) DEFAULT 'admin3@example.com',
ADD COLUMN IF NOT EXISTS venue_name VARCHAR(255) DEFAULT 'Oraduku Event Center',
ADD COLUMN IF NOT EXISTS venue_address VARCHAR(500) DEFAULT 'Accra, Ghana',
ADD COLUMN IF NOT EXISTS event_time VARCHAR(50) DEFAULT '6:00 PM',
ADD COLUMN IF NOT EXISTS early_bird_mode VARCHAR(20) DEFAULT 'deadline',
ADD COLUMN IF NOT EXISTS early_bird_enabled BOOLEAN DEFAULT TRUE;
        `
      });
    }

    // Try to update with default values for new columns
    const { error: updateError } = await supabaseAdmin
      .from('event_settings')
      .update({
        admin_email_1: existingSettings?.[0]?.admin_email_1 || 'admin1@example.com',
        admin_email_2: 'admin2@example.com',
        admin_email_3: 'admin3@example.com',
        venue_name: 'Oraduku Event Center',
        venue_address: 'Accra, Ghana',
        event_time: '6:00 PM',
        early_bird_mode: 'deadline',
        early_bird_enabled: true
      })
      .eq('id', existingSettings?.[0]?.id);

    if (updateError) {
      return NextResponse.json({
        success: false,
        error: updateError.message,
        message: 'Please run the migration SQL in your Supabase dashboard first.'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully'
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
