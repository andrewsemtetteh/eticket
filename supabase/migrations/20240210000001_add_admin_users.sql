-- Migration: Add admin users
-- Created: 2024-02-10
-- Description: Insert the three admin users for the e-tickets application

-- Insert admin users
INSERT INTO users (email, name, is_admin) VALUES
  ('arthurbernice201@gmail.com', 'Bernice Arthur', true),
  ('andrewsemtetteh@gmail.com', 'Andrew Sem Tetteh', true),
  ('arthurbelinda925@gmail.com', 'Belinda Arthur', true)
ON CONFLICT (email) DO UPDATE SET
  is_admin = true,
  name = EXCLUDED.name;
