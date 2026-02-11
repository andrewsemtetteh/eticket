// Comprehensive test and fix script for e-tickets application
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://clvxeerfxirxqjbgkzno.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdnhlZXJmeGlyeHFqYmdrem5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MjY5MDQsImV4cCI6MjA4NjMwMjkwNH0.e0FxMIDZw3_w7gIBPLTwyyDGrqkhqBbtKFn5qe4lZ6A';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdnhlZXJmeGlyeHFqYmdrem5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDcyNjkwNCwiZXhwIjoyMDg2MzAyOTA0fQ.btmdBI3fVTBam8bed9azAjah8RBI0_QjIYXlfrnwld0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function comprehensiveTest() {
  console.log('🚀 Starting comprehensive test and fix...\n');

  let issues = [];
  let fixes = [];

  try {
    // Test 1: Database connection
    console.log('1. Testing database connections...');
    
    const { data: anonTest, error: anonError } = await supabase.from('users').select('count');
    if (anonError) {
      issues.push('Anon client connection failed');
      console.log('❌ Anon client failed:', anonError.message);
    } else {
      console.log('✅ Anon client connected');
    }

    const { data: adminTest, error: adminError } = await supabaseAdmin.from('users').select('count');
    if (adminError) {
      issues.push('Admin client connection failed');
      console.log('❌ Admin client failed:', adminError.message);
    } else {
      console.log('✅ Admin client connected');
    }

    // Test 2: Check existing users
    console.log('\n2. Checking existing users...');
    const { data: existingUsers, error: usersError } = await supabaseAdmin.from('users').select('*');
    
    if (usersError) {
      issues.push('Cannot query users table');
      console.log('❌ Users query failed:', usersError.message);
    } else {
      console.log(`✅ Found ${existingUsers.length} existing users`);
      if (existingUsers.length > 0) {
        existingUsers.forEach(user => {
          console.log(`   - ${user.email} (Admin: ${user.is_admin})`);
        });
      }
    }

    // Test 3: Create admin users if they don't exist
    console.log('\n3. Creating admin users...');
    const adminUsers = [
      { email: 'arthurbernice201@gmail.com', name: 'Bernice Arthur' },
      { email: 'andrewsemtetteh@gmail.com', name: 'Andrew Sem Tetteh' },
      { email: 'arthurbelinda925@gmail.com', name: 'Belinda Arthur' }
    ];

    for (const adminUser of adminUsers) {
      // Check if user exists
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', adminUser.email)
        .single();

      if (existingUser) {
        console.log(`✅ ${adminUser.email} already exists`);
        
        // Update to ensure is_admin is true
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ is_admin: true, name: adminUser.name })
          .eq('email', adminUser.email);

        if (updateError) {
          issues.push(`Failed to update ${adminUser.email}`);
          console.log(`❌ Failed to update ${adminUser.email}:`, updateError.message);
        } else {
          fixes.push(`Updated ${adminUser.email} to admin`);
          console.log(`✅ Updated ${adminUser.email} to admin`);
        }
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabaseAdmin
          .from('users')
          .insert([{
            email: adminUser.email,
            name: adminUser.name,
            is_admin: true
          }])
          .select()
          .single();

        if (createError) {
          issues.push(`Failed to create ${adminUser.email}`);
          console.log(`❌ Failed to create ${adminUser.email}:`, createError.message);
        } else {
          fixes.push(`Created admin user ${adminUser.email}`);
          console.log(`✅ Created admin user ${adminUser.email}`);
        }
      }
    }

    // Test 4: Verify admin users
    console.log('\n4. Verifying admin users...');
    const { data: adminUsers_verify, error: adminVerifyError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('is_admin', true);

    if (adminVerifyError) {
      issues.push('Cannot verify admin users');
      console.log('❌ Admin verification failed:', adminVerifyError.message);
    } else {
      console.log(`✅ Found ${adminUsers_verify.length} admin users:`);
      adminUsers_verify.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.name})`);
      });
    }

    // Test 5: Test authentication API
    console.log('\n5. Testing authentication API...');
    try {
      const response = await fetch('http://localhost:3000/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'arthurbernice201@gmail.com',
          password: 'oraduku@2026!'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        fixes.push('Authentication API working');
        console.log('✅ Authentication API working');
        console.log('✅ Login successful for arthurbernice201@gmail.com');
      } else {
        issues.push(`Authentication failed: ${data.error}`);
        console.log(`❌ Authentication failed: ${data.error}`);
      }
    } catch (error) {
      issues.push(`Cannot reach authentication API: ${error.message}`);
      console.log(`❌ Cannot reach authentication API: ${error.message}`);
    }

    // Test 6: Check event settings
    console.log('\n6. Checking event settings...');
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('event_settings')
      .select('*')
      .single();

    if (settingsError) {
      console.log('❌ No event settings found, creating default...');
      
      const { data: newSettings, error: createSettingsError } = await supabaseAdmin
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

      if (createSettingsError) {
        issues.push('Failed to create event settings');
        console.log('❌ Failed to create event settings:', createSettingsError.message);
      } else {
        fixes.push('Created default event settings');
        console.log('✅ Created default event settings');
      }
    } else {
      console.log('✅ Event settings exist');
      console.log(`   - Event: ${settings.event_title}`);
      console.log(`   - Early Bird: GHS ${settings.early_bird_price}`);
      console.log(`   - General: GHS ${settings.general_price}`);
    }

    // Test 7: Test other API endpoints
    console.log('\n7. Testing other API endpoints...');
    
    try {
      const settingsResponse = await fetch('http://localhost:3000/api/settings');
      if (settingsResponse.ok) {
        fixes.push('Settings API working');
        console.log('✅ Settings API working');
      } else {
        issues.push('Settings API failed');
        console.log('❌ Settings API failed');
      }
    } catch (error) {
      issues.push(`Settings API unreachable: ${error.message}`);
      console.log(`❌ Settings API unreachable: ${error.message}`);
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    
    if (fixes.length > 0) {
      console.log('\n✅ FIXES APPLIED:');
      fixes.forEach(fix => console.log(`   - ${fix}`));
    }
    
    if (issues.length > 0) {
      console.log('\n❌ REMAINING ISSUES:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    } else {
      console.log('\n🎉 ALL TESTS PASSED! No issues found.');
    }

    console.log('\n🚀 NEXT STEPS:');
    if (issues.length === 0) {
      console.log('   - Try logging in at http://localhost:3000/admin/login');
      console.log('   - Email: arthurbernice201@gmail.com');
      console.log('   - Password: oraduku@2026!');
    } else {
      console.log('   - Fix the remaining issues listed above');
      console.log('   - Restart your Next.js dev server if needed');
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
    issues.push(`Unexpected error: ${error.message}`);
  }

  return { issues, fixes };
}

comprehensiveTest();
