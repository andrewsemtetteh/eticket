import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('🚀 Admin setup started');
    console.log('🔍 Environment check:', {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });

    const adminUsers = [
      { email: 'arthurbernice201@gmail.com', name: 'Bernice Arthur' },
      { email: 'andrewsemtetteh@gmail.com', name: 'Andrew Sem Tetteh' },
      { email: 'arthurbelinda925@gmail.com', name: 'Belinda Arthur' }
    ];

    const createdAdmins = [];

    // Create or update admin users
    for (const adminUser of adminUsers) {
      const { data: existingAdmin } = await supabase
        .from('users')
        .select('*')
        .eq('email', adminUser.email)
        .single();

      if (existingAdmin) {
        // Update existing user to be admin
        const { data: updatedAdmin, error: updateError } = await supabase
          .from('users')
          .update({ is_admin: true, name: adminUser.name })
          .eq('email', adminUser.email)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }
        createdAdmins.push(updatedAdmin);
      } else {
        // Create new admin user
        const { data: newAdmin, error: createError } = await supabase
          .from('users')
          .insert([{
            email: adminUser.email,
            name: adminUser.name,
            is_admin: true,
          }])
          .select()
          .single();

        if (createError) {
          throw createError;
        }
        createdAdmins.push(newAdmin);
      }
    }

    // Check if event settings exist
    const { data: existingSettings } = await supabase
      .from('event_settings')
      .select('*')
      .single();

    let settings = existingSettings;
    
    if (!existingSettings) {
      const { data: newSettings, error: settingsError } = await supabase
        .from('event_settings')
        .insert([{
          early_bird_price: 200,
          general_price: 300,
          early_bird_limit: 40,
          early_bird_end_date: '15 March 2026',
          total_ticket_limit: 100,
          event_date: 'April 25, 2026',
          event_title: 'Sitting with the Silence After the Noise',
        }])
        .select()
        .single();

      if (settingsError) {
        throw settingsError;
      }
      settings = newSettings;
    }

    return NextResponse.json({
      message: 'Admin users and settings created successfully',
      admins: createdAdmins,
      settings
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup admin user' },
      { status: 500 }
    );
  }
}
