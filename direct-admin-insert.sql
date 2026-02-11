-- Direct admin user insertion - run this in Supabase SQL Editor
-- This bypasses all RLS and migration issues

-- First, let's see what's in the users table
SELECT COUNT(*) as user_count FROM users;
SELECT * FROM users LIMIT 5;

-- Temporarily disable RLS completely
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Delete any existing admin users to avoid conflicts
DELETE FROM users WHERE email IN (
  'arthurbernice201@gmail.com',
  'andrewsemtetteh@gmail.com', 
  'arthurbelinda925@gmail.com'
);

-- Insert admin users directly
INSERT INTO users (id, email, name, is_admin, created_at, updated_at) VALUES
  (gen_random_uuid(), 'arthurbernice201@gmail.com', 'Bernice Arthur', true, NOW(), NOW()),
  (gen_random_uuid(), 'andrewsemtetteh@gmail.com', 'Andrew Sem Tetteh', true, NOW(), NOW()),
  (gen_random_uuid(), 'arthurbelinda925@gmail.com', 'Belinda Arthur', true, NOW(), NOW());

-- Verify the users were inserted
SELECT email, name, is_admin, created_at FROM users WHERE is_admin = true;

-- Re-enable RLS with service role policy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Ensure service role policy exists
DROP POLICY IF EXISTS "Service role can manage users" ON users;
CREATE POLICY "Service role can manage users" ON users FOR ALL USING (auth.role() = 'service_role');

-- Final verification
SELECT 'Admin users created successfully' as status, COUNT(*) as admin_count 
FROM users WHERE is_admin = true;
