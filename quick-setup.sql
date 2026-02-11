-- Quick Setup - Just the essentials to get admin login working
-- Run this in your Supabase SQL Editor first

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert your admin users immediately
INSERT INTO users (email, name, is_admin) VALUES
  ('arthurbernice201@gmail.com', 'Bernice Arthur', true),
  ('andrewsemtetteh@gmail.com', 'Andrew Sem Tetteh', true),
  ('arthurbelinda925@gmail.com', 'Belinda Arthur', true)
ON CONFLICT (email) DO UPDATE SET
  is_admin = true,
  name = EXCLUDED.name;

-- Enable RLS but allow service role access
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage users (needed for API)
CREATE POLICY "Service role can manage users" ON users FOR ALL USING (auth.role() = 'service_role');

-- Check that users were created
SELECT email, name, is_admin FROM users WHERE is_admin = true;
