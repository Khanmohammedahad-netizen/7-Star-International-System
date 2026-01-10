-- Part 1: Add new roles to the app_role enum
-- These must be committed separately before they can be used
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'pending';

-- Create vendor_type enum
DO $$ BEGIN
  CREATE TYPE public.vendor_type AS ENUM (
    'decor', 
    'catering', 
    'lighting', 
    'venue', 
    'security', 
    'audio_visual', 
    'photography', 
    'transportation', 
    'florist', 
    'furniture', 
    'staffing',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;