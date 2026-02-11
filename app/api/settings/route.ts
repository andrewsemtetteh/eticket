import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Settings API - Starting request...');
    
    console.log('⚙️ Settings fetch:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });

    // Get event settings
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('event_settings')
      .select('*')
      .single();

    console.log('🔍 Settings API - Database query result:', { 
      settings: settings ? 'Found' : 'Not found', 
      error: settingsError?.message,
      early_bird_mode: settings?.early_bird_mode,
      early_bird_limit: settings?.early_bird_limit,
      early_bird_end_date: settings?.early_bird_end_date,
      early_bird_enabled: settings?.early_bird_enabled
    });

    if (settingsError) {
      console.log('❌ Settings API - Database error:', settingsError);
      throw settingsError;
    }

    // Get ticket statistics
    const { data: tickets } = await supabaseAdmin
      .from('tickets')
      .select('type, quantity')
      .eq('status', 'confirmed');

    const stats = {
      earlyBirdSold: 0,
      generalSold: 0,
      totalSold: 0,
    };

    if (tickets) {
      tickets.forEach((ticket: any) => {
        if (ticket.type === 'early_bird') {
          stats.earlyBirdSold += ticket.quantity;
        } else {
          stats.generalSold += ticket.quantity;
        }
        stats.totalSold += ticket.quantity;
      });
    }

    // Early bird is available only if: enabled AND tickets left
    const earlyBirdEnabled = settings.early_bird_enabled !== false;
    
    // If early bird is disabled, count should be 0
    const earlyBirdLeft = earlyBirdEnabled 
      ? Math.max(0, settings.early_bird_limit - stats.earlyBirdSold)
      : 0;
    const earlyBirdAvailable = earlyBirdEnabled && earlyBirdLeft > 0;

    return NextResponse.json({
      settings,
      stats: {
        ...stats,
        earlyBirdLeft,
        earlyBirdAvailable,
        earlyBirdEnabled,
      }
    });

  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json();
    console.log('🔧 Settings PUT - Received updates:', updates);

    // First get the settings ID (there should only be one row)
    const { data: existingSettings } = await supabaseAdmin
      .from('event_settings')
      .select('id')
      .limit(1)
      .single();

    if (!existingSettings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }

    const { data: settings, error } = await supabaseAdmin
      .from('event_settings')
      .update(updates)
      .eq('id', existingSettings.id)
      .select()
      .single();

    console.log('🔧 Settings PUT - Update result:', { 
      success: !error, 
      error: error?.message,
      updatedFields: Object.keys(updates),
      early_bird_enabled: settings?.early_bird_enabled
    });

    if (error) {
      console.error('Settings update error details:', error);
      throw error;
    }

    return NextResponse.json({ settings });

  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
