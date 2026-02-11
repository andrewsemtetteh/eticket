// Run the complete setup directly via Supabase client
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function runCompleteSetup() {
  console.log('🚀 Running complete database setup...\n');

  const supabaseUrl = 'https://clvxeerfxirxqjbgkzno.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdnhlZXJmeGlyeHFqYmdrem5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MjY5MDQsImV4cCI6MjA4NjMwMjkwNH0.e0FxMIDZw3_w7gIBPLTwyyDGrqkhqBbtKFn5qe4lZ6A';

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('1. Creating users table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (tableError) {
      console.log('❌ Table creation failed:', tableError.message);
      // Try alternative approach
      console.log('Trying direct table creation...');
      
      const { error: directError } = await supabase
        .from('users')
        .select('count');
        
      if (directError && directError.message.includes('does not exist')) {
        console.log('❌ Users table does not exist. You need to run the SQL script manually in Supabase dashboard.');
        console.log('\nGo to: https://supabase.com/dashboard/project/clvxeerfxirxqjbgkzno/sql');
        console.log('Copy and paste the contents of supabase-complete-setup.sql');
        console.log('Then click Run to execute the script.');
        return;
      }
    } else {
      console.log('✅ Users table created/verified');
    }

    console.log('\n2. Inserting admin users...');
    
    const adminUsers = [
      { email: 'arthurbernice201@gmail.com', name: 'Bernice Arthur', is_admin: true },
      { email: 'andrewsemtetteh@gmail.com', name: 'Andrew Sem Tetteh', is_admin: true },
      { email: 'arthurbelinda925@gmail.com', name: 'Belinda Arthur', is_admin: true }
    ];

    for (const user of adminUsers) {
      const { data, error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'email' })
        .select();

      if (error) {
        console.log(`❌ Failed to insert ${user.email}:`, error.message);
      } else {
        console.log(`✅ Inserted/updated ${user.email}`);
      }
    }

    console.log('\n3. Verifying admin users...');
    const { data: admins, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('is_admin', true);

    if (verifyError) {
      console.log('❌ Verification failed:', verifyError.message);
    } else {
      console.log(`✅ Found ${admins.length} admin users:`);
      admins.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.name})`);
      });
    }

    console.log('\n🎉 Setup complete! Try logging in with:');
    console.log('Email: arthurbernice201@gmail.com');
    console.log('Password: oraduku@2026!');

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
    console.log('\n💡 Manual setup required:');
    console.log('1. Go to: https://supabase.com/dashboard/project/clvxeerfxirxqjbgkzno/sql');
    console.log('2. Copy and paste the contents of supabase-complete-setup.sql');
    console.log('3. Click Run to execute the script');
  }
}

runCompleteSetup();
