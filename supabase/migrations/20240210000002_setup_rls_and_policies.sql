-- Set up Row Level Security and policies
-- This migration sets up proper RLS policies for all tables

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Service role can manage payments" ON payments;
DROP POLICY IF EXISTS "Users can view own tickets" ON tickets;
DROP POLICY IF EXISTS "Service role can manage tickets" ON tickets;
DROP POLICY IF EXISTS "Anyone can view event settings" ON event_settings;
DROP POLICY IF EXISTS "Service role can manage event settings" ON event_settings;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role can manage users" ON users FOR ALL USING (auth.role() = 'service_role');

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage payments" ON payments FOR ALL USING (auth.role() = 'service_role');

-- Tickets policies
CREATE POLICY "Users can view own tickets" ON tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage tickets" ON tickets FOR ALL USING (auth.role() = 'service_role');

-- Event settings policies (read-only for users)
CREATE POLICY "Anyone can view event settings" ON event_settings FOR SELECT TO public USING (true);
CREATE POLICY "Service role can manage event settings" ON event_settings FOR ALL USING (auth.role() = 'service_role');
