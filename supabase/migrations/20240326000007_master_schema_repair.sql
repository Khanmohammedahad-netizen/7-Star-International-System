-- ==============================================================
-- MIGRATION 000007: MASTER SCHEMA REPAIR (Run this ONCE in Supabase SQL Editor)
-- This is idempotent — safe to run even if some columns already exist.
-- It normalizes the live schema to match what the app code expects.
-- ==============================================================

-- 1. ── INVOICES TABLE ──────────────────────────────────────────
-- Ensure the table exists first
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID,
  doc_type TEXT DEFAULT 'invoice',
  doc_number TEXT DEFAULT '',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending',
  client_name TEXT,
  subtotal DECIMAL(12,2) DEFAULT 0,
  vat_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  line_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add all expected columns safely (idempotent)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS event_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS doc_type TEXT DEFAULT 'invoice';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS doc_number TEXT DEFAULT '';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS issue_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total DECIMAL(12,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12,2) DEFAULT 0;  -- legacy variant
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS line_items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- If legacy 'invoice_number' column exists, copy its data into 'doc_number' and drop constraints
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'invoice_number'
  ) THEN
    -- Copy data from legacy column into the new one
    UPDATE invoices SET doc_number = invoice_number WHERE (doc_number IS NULL OR doc_number = '') AND invoice_number IS NOT NULL;
    -- Drop the NOT NULL constraint so it no longer blocks inserts
    ALTER TABLE invoices ALTER COLUMN invoice_number DROP NOT NULL;
    ALTER TABLE invoices ALTER COLUMN invoice_number SET DEFAULT '';
  END IF;
END $$;

-- Remove NOT NULL from doc_number (belt and suspenders)
ALTER TABLE invoices ALTER COLUMN doc_number DROP NOT NULL;
ALTER TABLE invoices ALTER COLUMN doc_number SET DEFAULT '';

-- RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated invoice access" ON invoices;
CREATE POLICY "Authenticated invoice access" ON invoices
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- 2. ── EXPENSES TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID,
  event_id UUID,
  description TEXT NOT NULL DEFAULT '',
  category TEXT DEFAULT 'general',
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  expense_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS event_id UUID;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS expense_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated expense access" ON expenses;
CREATE POLICY "Authenticated expense access" ON expenses
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- 3. ── EVENTS TABLE REPAIR ────────────────────────────────────
ALTER TABLE events ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'corporate';
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_name TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS expected_guests INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS budget_total DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE events ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#C9A84C';
ALTER TABLE events ADD COLUMN IF NOT EXISTS notes TEXT;

-- Fix the status constraint to include all values the app uses
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;
ALTER TABLE events ADD CONSTRAINT events_status_check 
  CHECK (status IN ('draft', 'planning', 'confirmed', 'in_progress', 'in progress', 'completed', 'cancelled', 'postponed'));


-- 4. ── VENDORS TABLE REPAIR ───────────────────────────────────
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 0;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS category TEXT;


-- 5. ── CLIENTS TABLE REPAIR ───────────────────────────────────
ALTER TABLE clients ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'UAE';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT;


-- 6. ── ACTIVITY LOG TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL DEFAULT '',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS org_id UUID;

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated activity access" ON activity_log;
CREATE POLICY "Authenticated activity access" ON activity_log
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- DONE. Run SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'invoices' to verify.
