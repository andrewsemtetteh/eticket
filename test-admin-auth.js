// Test script to check admin authentication
// Run this with: node test-admin-auth.js

const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = 'https://clvxeerfxirxqjbgkzno.supabase.co';
const supabaseKey = 'your-anon-key-here'; // Replace with your actual anon key

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminAuth() {
  console.log('🔍 Testing admin authentication...\n');

  try {
    // Test 1: Check if users table exists and has data
    console.log('1. Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.log('❌ Error accessing users table:', usersError.message);
      console.log('💡 This means you need to run the setup SQL script in Supabase first!');
      return;
    }

    console.log(`✅ Users table exists with ${users.length} users`);
    
    // Test 2: Check for admin users
    console.log('\n2. Checking for admin users...');
    const { data: admins, error: adminsError } = await supabase
      .from('users')
      .select('*')
      .eq('is_admin', true);

    if (adminsError) {
      console.log('❌ Error checking admin users:', adminsError.message);
      return;
    }

    if (admins.length === 0) {
      console.log('❌ No admin users found!');
      console.log('💡 You need to run the setup SQL script to create admin users.');
      return;
    }

    console.log(`✅ Found ${admins.length} admin users:`);
    admins.forEach(admin => {
      console.log(`   - ${admin.email} (${admin.name})`);
    });

    // Test 3: Test specific admin emails
    console.log('\n3. Testing specific admin emails...');
    const testEmails = [
      'arthurbernice201@gmail.com',
      'andrewsemtetteh@gmail.com', 
      'arthurbelinda925@gmail.com'
    ];

    for (const email of testEmails) {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('is_admin', true)
        .single();

      if (error || !user) {
        console.log(`❌ ${email} - Not found or not admin`);
      } else {
        console.log(`✅ ${email} - Found (${user.name})`);
      }
    }

    console.log('\n4. Testing password validation...');
    const testPassword = 'SwtSAtN@2026';
    console.log(`✅ Expected password: ${testPassword}`);
    console.log('💡 Make sure you\'re using this exact password when logging in.');

    console.log('\n🎉 Admin authentication test complete!');
    console.log('\nNext steps:');
    console.log('1. If no admin users were found, run the SQL setup script in Supabase');
    console.log('2. Update your .env.local with correct Supabase credentials');
    console.log('3. Try logging in with one of the admin emails and password: SwtSAtN@2026');

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

testAdminAuth();
