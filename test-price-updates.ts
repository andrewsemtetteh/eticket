import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });
config({ path: '.env' });

// Create Supabase client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testPriceUpdates() {
  try {
    console.log('🔍 Testing price update mechanism...\n');

    // Get current settings
    const { data: currentSettings, error: fetchError } = await supabaseAdmin
      .from('event_settings')
      .select('*')
      .single();

    if (fetchError) {
      console.error('❌ Error fetching current settings:', fetchError);
      return;
    }

    console.log('📊 Current Prices:');
    console.log(`   Early Bird: GHS ${currentSettings.early_bird_price}`);
    console.log(`   General: GHS ${currentSettings.general_price}`);

    // Test API call (simulate frontend)
    console.log('\n🌐 Testing API endpoint...');
    const response = await fetch('http://localhost:3000/api/settings');
    const apiData = await response.json();

    if (response.ok) {
      console.log('✅ API Response:');
      console.log(`   Early Bird: GHS ${apiData.settings?.early_bird_price}`);
      console.log(`   General: GHS ${apiData.settings?.general_price}`);
      
      // Check if they match
      const pricesMatch = 
        apiData.settings?.early_bird_price === currentSettings.early_bird_price &&
        apiData.settings?.general_price === currentSettings.general_price;
      
      if (pricesMatch) {
        console.log('✅ Prices match between database and API');
      } else {
        console.log('❌ Price mismatch detected!');
        console.log('💡 This could be due to caching or API issues');
      }
    } else {
      console.log('❌ API call failed:', apiData.error);
    }

    console.log('\n💡 Recommendations:');
    console.log('1. After changing prices in dashboard, wait 5-10 seconds');
    console.log('2. Refresh the tickets page to see updated prices');
    console.log('3. The frontend auto-refreshes every 30 seconds');
    console.log('4. Cache duration is now 5 seconds (was 30 seconds)');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPriceUpdates();
