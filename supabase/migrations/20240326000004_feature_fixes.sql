-- ==============================================================
-- MIGRATION 000004: Full Feature Fixes
-- Adds missing columns, fixes constraints, creates new tables
-- Run this in the Supabase SQL editor for your project
-- ==============================================================

-- 1. Fix events status CHECK constraint to include status values used by the app
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;
ALTER TABLE events ADD CONSTRAINT events_status_check 
  CHECK (status IN ('draft', 'planning', 'confirmed', 'in_progress', 'completed', 'cancelled', 'postponed'));

-- 2. Add missing columns to events
ALTER TABLE events 
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'corporate',
  ADD COLUMN IF NOT EXISTS venue_name TEXT,
  ADD COLUMN IF NOT EXISTS expected_guests INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS budget_total DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#C9A84C',
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. Add missing columns to vendors
ALTER TABLE vendors 
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT;

-- 4. Add missing columns to clients
ALTER TABLE clients 
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'UAE',
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- The clients table uses 'company' column (from migration 000000)
-- The API was incorrectly using 'company_name'. This is already fixed in the code.

-- 5. Invoices table (for Quotation & Invoice Generator)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  doc_type TEXT DEFAULT 'invoice' CHECK (doc_type IN ('invoice', 'quotation')),
  doc_number TEXT NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  client_name TEXT,
  subtotal DECIMAL(12,2) DEFAULT 0,
  vat_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  line_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated invoice access" ON invoices;
CREATE POLICY "Authenticated invoice access" ON invoices 
  FOR ALL USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

-- 6. Expenses table  
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  expense_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated expense access" ON expenses;
CREATE POLICY "Authenticated expense access" ON expenses 
  FOR ALL USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

-- 7. Activity Log table (for dashboard recent activity & notification badge)
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated activity access" ON activity_log;
CREATE POLICY "Authenticated activity access" ON activity_log 
  FOR ALL USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');
