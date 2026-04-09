-- PHASE 5: EVENTS SCHEMA EXPANSION
-- Adds missing operational columns for high-fidelity event management.

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'corporate',
ADD COLUMN IF NOT EXISTS venue_name TEXT,
ADD COLUMN IF NOT EXISTS expected_guests INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS budget_total DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#C9A84C',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update RLS (Ensure org_id is always present and enforced)
-- (Already handled by previous migration enabling RLS, but confirming here)
