-- Fix admin users creation by bypassing RLS temporarily
-- Run this in your Supabase SQL Editor

-- Disable RLS temporarily to insert admin users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Insert admin users
INSERT INTO users (email, name, is_admin) VALUES
  ('arthurbernice201@gmail.com', 'Bernice Arthur', true),
  ('andrewsemtetteh@gmail.com', 'Andrew Sem Tetteh', true),
  ('arthurbelinda925@gmail.com', 'Belinda Arthur', true)
ON CONFLICT (email) DO UPDATE SET
  is_admin = true,
  name = EXCLUDED.name;

-- Re-enable RLS with proper policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access (needed for API)
DROP POLICY IF EXISTS "Service role can manage users" ON users;
CREATE POLICY "Service role can manage users" ON users FOR ALL USING (auth.role() = 'service_role');

-- Verify users were created
SELECT email, name, is_admin FROM users WHERE is_admin = true;
