-- Add admin emails and venue information to event_settings table
ALTER TABLE event_settings 
ADD COLUMN IF NOT EXISTS admin_email_1 VARCHAR(255) DEFAULT 'admin1@example.com',
ADD COLUMN IF NOT EXISTS admin_email_2 VARCHAR(255) DEFAULT 'admin2@example.com',
ADD COLUMN IF NOT EXISTS admin_email_3 VARCHAR(255) DEFAULT 'admin3@example.com',
ADD COLUMN IF NOT EXISTS venue_name VARCHAR(255) DEFAULT 'Oraduku Event Center',
ADD COLUMN IF NOT EXISTS venue_address VARCHAR(500) DEFAULT 'Accra, Ghana',
ADD COLUMN IF NOT EXISTS event_time VARCHAR(50) DEFAULT '6:00 PM',
ADD COLUMN IF NOT EXISTS early_bird_mode VARCHAR(20) DEFAULT 'deadline' CHECK (early_bird_mode IN ('deadline', 'count')),
ADD COLUMN IF NOT EXISTS early_bird_enabled BOOLEAN DEFAULT TRUE;

-- Update existing row with default values if they exist
UPDATE event_settings SET
  admin_email_1 = COALESCE(admin_email_1, 'admin1@example.com'),
  admin_email_2 = COALESCE(admin_email_2, 'admin2@example.com'),
  admin_email_3 = COALESCE(admin_email_3, 'admin3@example.com'),
  venue_name = COALESCE(venue_name, 'Oraduku Event Center'),
  venue_address = COALESCE(venue_address, 'Accra, Ghana'),
  event_time = COALESCE(event_time, '6:00 PM'),
  early_bird_mode = COALESCE(early_bird_mode, 'deadline'),
  early_bird_enabled = COALESCE(early_bird_enabled, TRUE);
