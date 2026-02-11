// Debug the Settings API issue
const { createClient } = require('@supabase/supabase-js');

async function debugSettingsAPI() {
  console.log('🔍 Debugging Settings API...\n');

  const supabaseAdmin = createClient(
    'https://clvxeerfxirxqjbgkzno.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdnhlZXJmeGlyeHFqYmdrem5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDcyNjkwNCwiZXhwIjoyMDg2MzAyOTA0fQ.btmdBI3fVTBam8bed9azAjah8RBI0_QjIYXlfrnwld0'
  );

  try {
    // Test 1: Check if event_settings table exists and has data
    console.log('1. Checking event_settings table...');
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('event_settings')
      .select('*');

    if (settingsError) {
      console.log('❌ Event settings query error:', settingsError.message);
      return;
    }

    console.log(`✅ Found ${settings.length} event settings records`);
    if (settings.length > 0) {
      console.log('   First record:', settings[0]);
    }

    // Test 2: Try to get single record
    console.log('\n2. Testing single record query...');
    const { data: singleSetting, error: singleError } = await supabaseAdmin
      .from('event_settings')
      .select('*')
      .single();

    if (singleError) {
      console.log('❌ Single record error:', singleError.message);
      
      if (settings.length === 0) {
        console.log('💡 No settings found, creating default...');
        
        const { data: newSetting, error: createError } = await supabaseAdmin
          .from('event_settings')
          .insert([{
            early_bird_price: 200.00,
            general_price: 300.00,
            early_bird_limit: 40,
            early_bird_end_date: '15 March 2026',
            total_ticket_limit: 100,
            event_date: 'April 25, 2026',
            event_title: 'Sitting with the Silence After the Noise'
          }])
          .select()
          .single();

        if (createError) {
          console.log('❌ Failed to create settings:', createError.message);
        } else {
          console.log('✅ Created default settings:', newSetting);
        }
      }
    } else {
      console.log('✅ Single record query successful:', singleSetting);
    }

    // Test 3: Check tickets table for stats
    console.log('\n3. Testing tickets query for stats...');
    const { data: tickets, error: ticketsError } = await supabaseAdmin
      .from('tickets')
      .select('type, quantity')
      .eq('status', 'confirmed');

    if (ticketsError) {
      console.log('❌ Tickets query error:', ticketsError.message);
    } else {
      console.log(`✅ Found ${tickets.length} confirmed tickets`);
    }

    // Test 4: Simulate the full Settings API logic
    console.log('\n4. Testing full Settings API logic...');
    
    const { data: finalSettings, error: finalError } = await supabaseAdmin
      .from('event_settings')
      .select('*')
      .single();

    if (finalError) {
      console.log('❌ Final settings query failed:', finalError.message);
      return;
    }

    const { data: finalTickets } = await supabaseAdmin
      .from('tickets')
      .select('type, quantity')
      .eq('status', 'confirmed');

    const stats = {
      earlyBirdSold: 0,
      generalSold: 0,
      totalSold: 0,
    };

    if (finalTickets) {
      finalTickets.forEach(ticket => {
        if (ticket.type === 'early_bird') {
          stats.earlyBirdSold += ticket.quantity;
        } else {
          stats.generalSold += ticket.quantity;
        }
        stats.totalSold += ticket.quantity;
      });
    }

    const earlyBirdLeft = Math.max(0, finalSettings.early_bird_limit - stats.earlyBirdSold);
    const earlyBirdAvailable = earlyBirdLeft > 0;

    const result = {
      settings: finalSettings,
      stats: {
        ...stats,
        earlyBirdLeft,
        earlyBirdAvailable,
      }
    };

    console.log('✅ Full API logic successful');
    console.log('   Result:', JSON.stringify(result, null, 2));

    // Test 5: Make actual API call
    console.log('\n5. Testing actual API endpoint...');
    try {
      const response = await fetch('http://localhost:3000/api/settings');
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ API endpoint working now!');
        console.log('   Response:', JSON.stringify(data, null, 2));
      } else {
        console.log('❌ API endpoint still failing:', data.error);
        console.log('   Status:', response.status);
      }
    } catch (error) {
      console.log('❌ API call error:', error.message);
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

debugSettingsAPI();
