// Test APIs with proper authentication
async function testWithAuth() {
  console.log('🔐 Testing APIs with authentication...\n');

  const baseUrl = 'http://localhost:3000';
  
  // Step 1: Login to get authentication cookie
  console.log('1. Logging in to get auth cookie...');
  const loginResponse = await fetch(`${baseUrl}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'arthurbernice201@gmail.com',
      password: 'oraduku@2026!'
    })
  });

  if (!loginResponse.ok) {
    console.log('❌ Login failed, cannot test authenticated APIs');
    return;
  }

  // Extract the cookie from the response
  const setCookieHeader = loginResponse.headers.get('set-cookie');
  const authCookie = setCookieHeader ? setCookieHeader.split(';')[0] : '';
  
  console.log('✅ Login successful, got auth cookie');

  // Step 2: Test Settings API
  console.log('\n2. Testing Settings API...');
  try {
    const response = await fetch(`${baseUrl}/api/settings`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Settings API working');
      console.log(`   - Event: ${data.settings.event_title}`);
    } else {
      console.log('❌ Settings API failed:', data.error);
      console.log('   - Status:', response.status);
    }
  } catch (error) {
    console.log('❌ Settings API error:', error.message);
  }

  // Step 3: Test Admin Analytics with auth
  console.log('\n3. Testing Admin Analytics API (with auth)...');
  try {
    const response = await fetch(`${baseUrl}/api/admin/analytics`, {
      headers: {
        'Cookie': authCookie
      }
    });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin Analytics API working');
      console.log(`   - Total Tickets: ${data.analytics.tickets.total}`);
    } else {
      console.log('❌ Admin Analytics API failed:', data.error);
      console.log('   - Status:', response.status);
    }
  } catch (error) {
    console.log('❌ Admin Analytics API error:', error.message);
  }

  // Step 4: Test Admin Tickets with auth
  console.log('\n4. Testing Admin Tickets API (with auth)...');
  try {
    const response = await fetch(`${baseUrl}/api/admin/tickets`, {
      headers: {
        'Cookie': authCookie
      }
    });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin Tickets API working');
      console.log(`   - Found ${data.tickets.length} tickets`);
    } else {
      console.log('❌ Admin Tickets API failed:', data.error);
      console.log('   - Status:', response.status);
    }
  } catch (error) {
    console.log('❌ Admin Tickets API error:', error.message);
  }

  // Step 5: Test creating a test user for tickets API
  console.log('\n5. Creating test user for tickets API...');
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      'https://clvxeerfxirxqjbgkzno.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdnhlZXJmeGlyeHFqYmdrem5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDcyNjkwNCwiZXhwIjoyMDg2MzAyOTA0fQ.btmdBI3fVTBam8bed9azAjah8RBI0_QjIYXlfrnwld0'
    );

    // Create test user
    const { data: testUser, error: userError } = await supabaseAdmin
      .from('users')
      .upsert({
        email: 'test@example.com',
        name: 'Test User',
        is_admin: false
      }, { onConflict: 'email' })
      .select()
      .single();

    if (userError) {
      console.log('❌ Failed to create test user:', userError.message);
    } else {
      console.log('✅ Test user created/updated');
      
      // Test tickets API with test user
      const response = await fetch(`${baseUrl}/api/tickets?email=test@example.com`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Public Tickets API working');
        console.log(`   - Found ${data.tickets.length} tickets for test user`);
      } else {
        console.log('❌ Public Tickets API failed:', data.error);
      }
    }
  } catch (error) {
    console.log('❌ Test user creation error:', error.message);
  }

  console.log('\n🎯 SUMMARY:');
  console.log('- Admin authentication is working');
  console.log('- Check server console for Settings API error details');
  console.log('- Admin APIs should work with proper authentication');
}

testWithAuth();
