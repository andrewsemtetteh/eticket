// Test Supabase connection directly
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  const supabaseUrl = 'https://clvxeerfxirxqjbgkzno.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdnhlZXJmeGlyeHFqYmdrem5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MjY5MDQsImV4cCI6MjA4NjMwMjkwNH0.e0FxMIDZw3_w7gIBPLTwyyDGrqkhqBbtKFn5qe4lZ6A';

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('1. Testing basic connection...');
    const { data, error } = await supabase.from('users').select('count');
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return;
    }
    
    console.log('✅ Connection successful');

    console.log('\n2. Testing users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.log('❌ Users table error:', usersError.message);
      return;
    }

    console.log(`✅ Found ${users.length} users in database`);
    
    console.log('\n3. Testing admin users...');
    const { data: admins, error: adminsError } = await supabase
      .from('users')
      .select('*')
      .eq('is_admin', true);

    if (adminsError) {
      console.log('❌ Admin query error:', adminsError.message);
      return;
    }

    console.log(`✅ Found ${admins.length} admin users:`);
    admins.forEach(admin => {
      console.log(`   - ${admin.email} (${admin.name}) - Admin: ${admin.is_admin}`);
    });

    console.log('\n4. Testing specific email lookup...');
    const testEmail = 'arthurbernice201@gmail.com';
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .eq('is_admin', true)
      .single();

    if (userError) {
      console.log(`❌ User lookup error for ${testEmail}:`, userError.message);
    } else {
      console.log(`✅ Found user: ${user.email} (${user.name}) - Admin: ${user.is_admin}`);
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

testSupabaseConnection();
