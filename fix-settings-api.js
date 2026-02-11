// Fix settings API by ensuring event_settings table has default data
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://clvxeerfxirxqjbgkzno.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdnhlZXJmeGlyeHFqYmdrem5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDcyNjkwNCwiZXhwIjoyMDg2MzAyOTA0fQ.btmdBI3fVTBam8bed9azAjah8RBI0_QjIYXlfrnwld0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSettingsAPI() {
  console.log('🔧 Fixing Settings API...\n');

  try {
    // Check if event_settings table exists and has data
    console.log('1. Checking event_settings table...');
    const { data: settings, error: selectError } = await supabase
      .from('event_settings')
      .select('*')
      .single();

    if (selectError) {
      console.log('❌ Error reading event_settings:', selectError.message);
      
      if (selectError.code === 'PGRST116') {
        console.log('📝 No data found, inserting default settings...');
        
        // Insert default settings
        const { data: newSettings, error: insertError } = await supabase
          .from('event_settings')
          .insert({
            early_bird_price: 200.00,
            general_price: 300.00,
            early_bird_limit: 40,
            early_bird_end_date: '15 March 2026',
            total_ticket_limit: 100,
            event_date: 'April 25, 2026',
            event_title: 'Sitting with the Silence After the Noise'
          })
          .select()
          .single();

        if (insertError) {
          console.log('❌ Error inserting default settings:', insertError.message);
          return;
        }

        console.log('✅ Default settings inserted successfully');
        console.log('   Settings:', newSettings);
      } else {
        console.log('❌ Database error:', selectError.message);
        return;
      }
    } else {
      console.log('✅ Event settings found');
      console.log('   Settings:', settings);
    }

    // Test the settings API endpoint
    console.log('\n2. Testing settings API endpoint...');
    try {
      const response = await fetch('http://localhost:3000/api/settings');
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Settings API working correctly');
        console.log('   Response:', data);
      } else {
        console.log('❌ Settings API failed:', data.error);
      }
    } catch (fetchError) {
      console.log('❌ Could not test API endpoint (server might not be running)');
      console.log('   Error:', fetchError.message);
    }

    console.log('\n🎉 Settings API fix completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixSettingsAPI();
