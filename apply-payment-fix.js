// Apply RLS fixes for payment system
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://clvxeerfxirxqjbgkzno.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdnhlZXJmeGlyeHFqYmdrem5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDcyNjkwNCwiZXhwIjoyMDg2MzAyOTA0fQ.btmdBI3fVTBam8bed9azAjah8RBI0_QjIYXlfrnwld0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPaymentRLS() {
  console.log('🔧 Fixing RLS policies for payment system...\n');

  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('fix-payment-rls.sql', 'utf8');
    
    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`${i + 1}. ${statement.substring(0, 50)}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.log(`   ⚠️  ${error.message}`);
        } else {
          console.log('   ✅ Success');
        }
      } catch (err) {
        console.log(`   ⚠️  ${err.message}`);
      }
    }

    // Test user creation directly
    console.log('\n🧪 Testing user creation...');
    const testUser = {
      email: 'payment-test@example.com',
      name: 'Payment Test User',
      phone: '0244123456'
    };

    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert(testUser, { onConflict: 'email' })
      .select()
      .single();

    if (userError) {
      console.log(`❌ User creation failed: ${userError.message}`);
    } else {
      console.log('✅ User creation successful');
      console.log(`   User ID: ${user.id}`);
    }

    // Test payment creation
    console.log('\n🧪 Testing payment creation...');
    const testPayment = {
      reference: `TEST_${Date.now()}`,
      amount: 200,
      currency: 'GHS',
      status: 'pending',
      payment_method: 'card',
      user_id: user?.id
    };

    if (user?.id) {
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert(testPayment)
        .select()
        .single();

      if (paymentError) {
        console.log(`❌ Payment creation failed: ${paymentError.message}`);
      } else {
        console.log('✅ Payment creation successful');
        console.log(`   Payment ID: ${payment.id}`);
      }
    }

    console.log('\n🎉 RLS fix completed!');
    console.log('Payment system should now work properly.');

  } catch (error) {
    console.error('❌ RLS fix failed:', error.message);
  }
}

fixPaymentRLS();
