// Comprehensive Payment System Test
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Simple fetch implementation for Node.js
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const lib = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = lib.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

const BASE_URL = 'http://localhost:3000';

// Test data
const testPaymentData = {
  email: 'test@example.com',
  name: 'Test User Payment',
  phone: '0244123456',
  ticketType: 'early-bird',
  quantity: 2,
  amount: 400 // 2 x 200 GHS early bird tickets
};

async function testPaymentSystem() {
  console.log('🧪 Testing Payment System Functionality\n');

  try {
    // Test 1: Check if payment initialization endpoint is accessible
    console.log('1. Testing Payment Initialization Endpoint...');
    const initResponse = await fetch(`${BASE_URL}/api/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPaymentData)
    });

    console.log(`   Status: ${initResponse.status}`);
    
    if (initResponse.ok) {
      const initData = await initResponse.json();
      console.log('   ✅ Payment initialization successful');
      console.log(`   Authorization URL: ${initData.authorization_url ? 'Generated' : 'Missing'}`);
      console.log(`   Access Code: ${initData.access_code ? 'Generated' : 'Missing'}`);
      console.log(`   Reference: ${initData.reference || 'Missing'}`);
      
      // Test 2: Test payment verification endpoint (with mock reference)
      console.log('\n2. Testing Payment Verification Endpoint...');
      const mockReference = initData.reference || 'test_ref_' + Date.now();
      
      const verifyResponse = await fetch(`${BASE_URL}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference: mockReference })
      });

      console.log(`   Status: ${verifyResponse.status}`);
      const verifyData = await verifyResponse.json();
      
      if (verifyResponse.status === 400 && verifyData.error === 'Payment verification failed') {
        console.log('   ✅ Verification endpoint accessible (expected failure for test reference)');
      } else {
        console.log(`   ⚠️  Unexpected response: ${verifyData.error || 'Unknown'}`);
      }

    } else {
      const errorData = await initResponse.json();
      console.log(`   ❌ Payment initialization failed: ${errorData.error}`);
    }

    // Test 3: Check settings API (needed for pricing)
    console.log('\n3. Testing Settings API (for pricing data)...');
    const settingsResponse = await fetch(`${BASE_URL}/api/settings`);
    console.log(`   Status: ${settingsResponse.status}`);
    
    if (settingsResponse.ok) {
      const settingsData = await settingsResponse.json();
      console.log('   ✅ Settings API working');
      console.log(`   Early Bird Price: GHS ${settingsData.settings?.early_bird_price || 'N/A'}`);
      console.log(`   General Price: GHS ${settingsData.settings?.general_price || 'N/A'}`);
      console.log(`   Early Bird Available: ${settingsData.stats?.earlyBirdAvailable ? 'Yes' : 'No'}`);
    } else {
      console.log('   ❌ Settings API failed');
    }

    // Test 4: Check callback endpoint
    console.log('\n4. Testing Payment Callback Endpoint...');
    const callbackResponse = await fetch(`${BASE_URL}/api/payments/callback?reference=test_callback_ref`);
    console.log(`   Status: ${callbackResponse.status}`);
    
    if (callbackResponse.status === 307 || callbackResponse.status === 302) {
      console.log('   ✅ Callback endpoint working (redirects to confirmation)');
    } else {
      console.log('   ⚠️  Unexpected callback response');
    }

    // Test 5: Environment Variables Check
    console.log('\n5. Checking Environment Variables...');
    console.log('   Paystack Public Key:', process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ? '✅ Set' : '❌ Missing');
    console.log('   Paystack Secret Key:', process.env.PAYSTACK_SECRET_KEY ? '✅ Set' : '❌ Missing');
    console.log('   Base URL:', process.env.NEXT_PUBLIC_BASE_URL || 'Using default');

    // Test 6: Database Connection Test
    console.log('\n6. Testing Database Operations...');
    
    // Test user creation/lookup
    const testUserData = {
      email: 'dbtest@example.com',
      name: 'DB Test User',
      phone: '0244999888'
    };

    const dbTestResponse = await fetch(`${BASE_URL}/api/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...testUserData,
        ticketType: 'general',
        quantity: 1,
        amount: 300
      })
    });

    if (dbTestResponse.ok) {
      console.log('   ✅ Database operations working (user creation/lookup)');
    } else {
      const dbError = await dbTestResponse.json();
      console.log(`   ❌ Database operations failed: ${dbError.error}`);
    }

    console.log('\n📊 Payment System Test Summary:');
    console.log('   - Payment initialization endpoint: Tested');
    console.log('   - Payment verification endpoint: Tested');
    console.log('   - Settings API: Tested');
    console.log('   - Callback endpoint: Tested');
    console.log('   - Environment variables: Checked');
    console.log('   - Database operations: Tested');

    console.log('\n🔍 Next Steps for Manual Testing:');
    console.log('   1. Visit /checkout?type=early-bird&qty=1');
    console.log('   2. Fill in customer details');
    console.log('   3. Click "Pay GHS [amount]" button');
    console.log('   4. Complete payment on Paystack');
    console.log('   5. Verify redirect to confirmation page');
    console.log('   6. Check admin panel for new tickets');

  } catch (error) {
    console.error('❌ Payment system test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solution: Start the development server with "npm run dev"');
    }
  }
}

// Run the test
testPaymentSystem();
