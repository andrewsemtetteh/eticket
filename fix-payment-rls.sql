-- Fix RLS policies for payment system
-- This script allows the payment system to create users and process payments

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can only see their own data" ON users;
DROP POLICY IF EXISTS "Users can only update their own data" ON users;
DROP POLICY IF EXISTS "Only authenticated users can insert" ON users;

-- Create more permissive policies for payment processing
CREATE POLICY "Allow user creation for payments" ON users
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow user read for payments" ON users
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow user updates for payments" ON users
  FOR UPDATE 
  USING (true);

-- Ensure payments table has proper policies
DROP POLICY IF EXISTS "Users can only see their own payments" ON payments;
DROP POLICY IF EXISTS "Users can only create their own payments" ON payments;

CREATE POLICY "Allow payment creation" ON payments
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow payment read" ON payments
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow payment updates" ON payments
  FOR UPDATE 
  USING (true);

-- Ensure tickets table has proper policies
DROP POLICY IF EXISTS "Users can only see their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can only create their own tickets" ON tickets;

CREATE POLICY "Allow ticket creation" ON tickets
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow ticket read" ON tickets
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow ticket updates" ON tickets
  FOR UPDATE 
  USING (true);

-- Grant necessary permissions to anon role for payment processing
GRANT INSERT, SELECT, UPDATE ON users TO anon;
GRANT INSERT, SELECT, UPDATE ON payments TO anon;
GRANT INSERT, SELECT, UPDATE ON tickets TO anon;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
