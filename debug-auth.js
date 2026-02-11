// Debug authentication - check what's happening
// Run with: node debug-auth.js

async function debugAuth() {
  console.log('🔍 Debugging admin authentication...\n');

  // Test the API endpoint directly
  const testLogin = async (email, password) => {
    try {
      console.log(`Testing login for: ${email}`);
      
      const response = await fetch('http://localhost:3000/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ Login successful for ${email}`);
        console.log('User data:', data.user);
      } else {
        console.log(`❌ Login failed for ${email}: ${data.error}`);
        console.log('Status:', response.status);
      }
      
      return { success: response.ok, data, status: response.status };
    } catch (error) {
      console.log(`❌ Network error for ${email}:`, error.message);
      return { success: false, error: error.message };
    }
  };

  // Test all admin emails
  const adminEmails = [
    'arthurbernice201@gmail.com',
    'andrewsemtetteh@gmail.com',
    'arthurbelinda925@gmail.com'
  ];

  const password = 'oraduku@2026!';
  
  console.log(`Testing with password: ${password}\n`);

  for (const email of adminEmails) {
    await testLogin(email, password);
    console.log('---');
  }

  console.log('\n💡 If all logins failed with "Invalid credentials":');
  console.log('1. Check if you ran the SQL setup script in Supabase');
  console.log('2. Verify your .env.local has correct Supabase credentials');
  console.log('3. Make sure your Next.js dev server is running on port 3000');
}

// Only run if this file is executed directly
if (require.main === module) {
  debugAuth();
}

module.exports = { debugAuth };
