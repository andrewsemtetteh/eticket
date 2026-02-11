-- Insert default data including admin users and event settings
-- This migration temporarily disables RLS to insert admin users

-- Temporarily disable RLS on users table to insert admin users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Insert admin users
INSERT INTO users (email, name, is_admin) VALUES
  ('arthurbernice201@gmail.com', 'Bernice Arthur', true),
  ('andrewsemtetteh@gmail.com', 'Andrew Sem Tetteh', true),
  ('arthurbelinda925@gmail.com', 'Belinda Arthur', true)
ON CONFLICT (email) DO UPDATE SET
  is_admin = true,
  name = EXCLUDED.name;

-- Re-enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Insert default event settings
INSERT INTO event_settings (early_bird_price, general_price, early_bird_limit, early_bird_end_date, total_ticket_limit, event_date, event_title)
VALUES (200.00, 300.00, 40, '15 March 2026', 100, 'April 25, 2026', 'Sitting with the Silence After the Noise')
ON CONFLICT DO NOTHING;
