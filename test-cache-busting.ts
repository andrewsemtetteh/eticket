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

async function testCacheBusting() {
  try {
    console.log('🧪 Testing cache-busting mechanism...\n');

    // Test 1: Normal API call (should use cache)
    console.log('📋 Test 1: Normal API call');
    const response1 = await fetch('http://localhost:3000/api/settings');
    const data1 = await response1.json();
    console.log('✅ Response received');

    // Test 2: Cache-busting call (should bypass cache)
    console.log('\n📋 Test 2: Cache-busting call');
    const response2 = await fetch('http://localhost:3000/api/settings?bust=true');
    const data2 = await response2.json();
    console.log('✅ Cache-busting response received');

    // Test 3: Timestamp-based call (should bypass cache)
    console.log('\n📋 Test 3: Timestamp-based call');
    const response3 = await fetch(`http://localhost:3000/api/settings?t=${Date.now()}&bust=true`);
    const data3 = await response3.json();
    console.log('✅ Timestamp-based response received');

    // Verify all responses have the same data
    const pricesMatch = 
      data1.settings?.early_bird_price === data2.settings?.early_bird_price &&
      data2.settings?.early_bird_price === data3.settings?.early_bird_price &&
      data1.settings?.general_price === data2.settings?.general_price &&
      data2.settings?.general_price === data3.settings?.general_price;

    if (pricesMatch) {
      console.log('\n✅ All API calls return consistent data');
      console.log('📊 Current prices:');
      console.log(`   Early Bird: GHS ${data1.settings?.early_bird_price}`);
      console.log(`   General: GHS ${data1.settings?.general_price}`);
    } else {
      console.log('\n❌ Price mismatch detected between API calls');
    }

    console.log('\n💡 Cache-busting is working if:');
    console.log('✅ API responds to ?bust=true parameter');
    console.log('✅ Frontend uses ?t={timestamp}&bust=true');
    console.log('✅ Cache duration is 1 second');
    console.log('✅ Auto-refresh is every 15 seconds');

    console.log('\n🚀 For deployment:');
    console.log('1. Redeploy your application with these changes');
    console.log('2. Test price changes in dashboard');
    console.log('3. Refresh tickets page after 15 seconds');
    console.log('4. Prices should update automatically');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('💡 Make sure your development server is running on localhost:3000');
  }
}

testCacheBusting();
