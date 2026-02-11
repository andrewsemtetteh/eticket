// Debug and fix the settings API issue
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://clvxeerfxirxqjbgkzno.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdnhlZXJmeGlyeHFqYmdrem5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDcyNjkwNCwiZXhwIjoyMDg2MzAyOTA0fQ.btmdBI3fVTBam8bed9azAjah8RBI0_QjIYXlfrnwld0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugSettingsIssue() {
  console.log('🔧 Debugging Settings API Issue...\n');

  try {
    // Check how many rows exist in event_settings
    console.log('1. Checking event_settings table...');
    const { data: allSettings, error: selectError } = await supabase
      .from('event_settings')
      .select('*');

    if (selectError) {
      console.log('❌ Error reading event_settings:', selectError.message);
      return;
    }

    console.log(`📊 Found ${allSettings.length} rows in event_settings table`);
    
    if (allSettings.length === 0) {
      console.log('📝 No settings found, inserting default...');
      
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
        console.log('❌ Error inserting settings:', insertError.message);
        return;
      }

      console.log('✅ Default settings inserted');
    } else if (allSettings.length > 1) {
      console.log('⚠️  Multiple settings rows found, keeping only the first one...');
      
      // Keep the first row, delete the rest
      const keepId = allSettings[0].id;
      const deleteIds = allSettings.slice(1).map(s => s.id);
      
      for (const id of deleteIds) {
        const { error: deleteError } = await supabase
          .from('event_settings')
          .delete()
          .eq('id', id);
          
        if (deleteError) {
          console.log(`❌ Error deleting duplicate row ${id}:`, deleteError.message);
        } else {
          console.log(`✅ Deleted duplicate row ${id}`);
        }
      }
    } else {
      console.log('✅ Exactly one settings row found - this is correct');
    }

    // Test the .single() query that the API uses
    console.log('\n2. Testing .single() query...');
    const { data: singleSettings, error: singleError } = await supabase
      .from('event_settings')
      .select('*')
      .single();

    if (singleError) {
      console.log('❌ .single() query failed:', singleError.message);
      console.log('   Error code:', singleError.code);
    } else {
      console.log('✅ .single() query successful');
      console.log('   Settings:', singleSettings);
    }

    // Test the API endpoint
    console.log('\n3. Testing API endpoint...');
    try {
      const response = await fetch('http://localhost:3000/api/settings');
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Settings API working');
        console.log('   Response:', data);
      } else {
        const errorData = await response.json();
        console.log('❌ Settings API failed:', response.status, errorData);
      }
    } catch (fetchError) {
      console.log('❌ Could not test API (server might not be running):', fetchError.message);
    }

    console.log('\n🎉 Settings debug completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugSettingsIssue();
