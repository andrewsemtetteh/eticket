// Test all API endpoints to ensure everything is working
async function testAllAPIs() {
  console.log('🧪 Testing all API endpoints...\n');

  const baseUrl = 'http://localhost:3000';
  let results = [];

  // Test 1: Settings API (GET)
  console.log('1. Testing Settings API (GET)...');
  try {
    const response = await fetch(`${baseUrl}/api/settings`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Settings API working');
      console.log(`   - Event: ${data.settings.event_title}`);
      console.log(`   - Early Bird Price: GHS ${data.settings.early_bird_price}`);
      results.push({ endpoint: 'GET /api/settings', status: 'PASS' });
    } else {
      console.log('❌ Settings API failed:', data.error);
      results.push({ endpoint: 'GET /api/settings', status: 'FAIL', error: data.error });
    }
  } catch (error) {
    console.log('❌ Settings API error:', error.message);
    results.push({ endpoint: 'GET /api/settings', status: 'ERROR', error: error.message });
  }

  // Test 2: Admin Login API - Test all three admin users
  console.log('\n2. Testing Admin Login API for all admin users...');
  
  const adminUsers = [
    { email: 'arthurbernice201@gmail.com', name: 'Bernice Arthur' },
    { email: 'andrewsemtetteh@gmail.com', name: 'Andrew Sem Tetteh' },
    { email: 'arthurbelinda925@gmail.com', name: 'Belinda Arthur' }
  ];

  let adminLoginsPassed = 0;
  
  for (const admin of adminUsers) {
    try {
      console.log(`   Testing login for ${admin.name}...`);
      const response = await fetch(`${baseUrl}/api/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: admin.email,
          password: 'oraduku@2026!'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log(`   ✅ ${admin.name} login successful`);
        adminLoginsPassed++;
      } else {
        console.log(`   ❌ ${admin.name} login failed: ${data.error}`);
      }
    } catch (error) {
      console.log(`   ❌ ${admin.name} login error: ${error.message}`);
    }
  }

  if (adminLoginsPassed === adminUsers.length) {
    console.log('✅ All admin logins working');
    results.push({ endpoint: 'POST /api/admin/auth/login (all admins)', status: 'PASS' });
  } else {
    console.log(`❌ Only ${adminLoginsPassed}/${adminUsers.length} admin logins working`);
    results.push({ endpoint: 'POST /api/admin/auth/login (all admins)', status: 'FAIL', error: `Only ${adminLoginsPassed}/${adminUsers.length} admins can login` });
  }

  // Test 3: Admin Analytics API (requires authentication)
  console.log('\n3. Testing Admin Analytics API...');
  try {
    const response = await fetch(`${baseUrl}/api/admin/analytics`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin Analytics API working');
      console.log(`   - Total Tickets: ${data.analytics.tickets.total}`);
      results.push({ endpoint: 'GET /api/admin/analytics', status: 'PASS' });
    } else {
      console.log('❌ Admin Analytics API failed:', data.error);
      results.push({ endpoint: 'GET /api/admin/analytics', status: 'FAIL', error: data.error });
    }
  } catch (error) {
    console.log('❌ Admin Analytics API error:', error.message);
    results.push({ endpoint: 'GET /api/admin/analytics', status: 'ERROR', error: error.message });
  }

  // Test 4: Admin Tickets API
  console.log('\n4. Testing Admin Tickets API...');
  try {
    const response = await fetch(`${baseUrl}/api/admin/tickets`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin Tickets API working');
      console.log(`   - Found ${data.tickets.length} tickets`);
      results.push({ endpoint: 'GET /api/admin/tickets', status: 'PASS' });
    } else {
      console.log('❌ Admin Tickets API failed:', data.error);
      results.push({ endpoint: 'GET /api/admin/tickets', status: 'FAIL', error: data.error });
    }
  } catch (error) {
    console.log('❌ Admin Tickets API error:', error.message);
    results.push({ endpoint: 'GET /api/admin/tickets', status: 'ERROR', error: error.message });
  }

  // Test 5: Tickets API (public)
  console.log('\n5. Testing Public Tickets API...');
  try {
    const response = await fetch(`${baseUrl}/api/tickets?email=test@example.com`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Public Tickets API working');
      console.log(`   - Found ${data.tickets.length} tickets for test email`);
      results.push({ endpoint: 'GET /api/tickets', status: 'PASS' });
    } else {
      console.log('❌ Public Tickets API failed:', data.error);
      results.push({ endpoint: 'GET /api/tickets', status: 'FAIL', error: data.error });
    }
  } catch (error) {
    console.log('❌ Public Tickets API error:', error.message);
    results.push({ endpoint: 'GET /api/tickets', status: 'ERROR', error: error.message });
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 API TEST RESULTS');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  
  console.log(`\n✅ PASSED: ${passed}`);
  console.log(`❌ FAILED: ${failed}`);
  console.log(`🔥 ERRORS: ${errors}`);
  
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '🔥';
    console.log(`${icon} ${result.endpoint} - ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  if (passed === results.length) {
    console.log('\n🎉 ALL API TESTS PASSED!');
    console.log('\n🚀 READY TO USE:');
    console.log('   - Admin Login: http://localhost:3000/admin/login');
    console.log('   - Admin Users:');
    console.log('     • arthurbernice201@gmail.com (Bernice Arthur)');
    console.log('     • andrewsemtetteh@gmail.com (Andrew Sem Tetteh)');
    console.log('     • arthurbelinda925@gmail.com (Belinda Arthur)');
    console.log('   - Password: oraduku@2026!');
  } else {
    console.log('\n⚠️  Some APIs need attention. Check the errors above.');
  }

  return results;
}

testAllAPIs();
