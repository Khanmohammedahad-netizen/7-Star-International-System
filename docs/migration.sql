-- ═══════════════════════════════════════════════════════════
-- 7STAR OS — Migration Script
-- ONLY alters existing billing tables — adds event_id column
-- Run this BEFORE schema.sql on existing databases
-- ═══════════════════════════════════════════════════════════

-- Step 1: Add event_id to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS event_id UUID;

-- Step 2: Add event_id to estimates
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS event_id UUID;

-- Step 3: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_event  ON invoices(event_id);
CREATE INDEX IF NOT EXISTS idx_estimates_event ON estimates(event_id);

-- BACKFILL NOTE:
-- Existing records with event_id = NULL are valid orphan records.
-- They remain accessible in billing system exactly as before.
-- They will NOT appear in any event's finance tab (filtered by event_id IS NOT NULL).
-- Manual backfill (optional): UPDATE invoices SET event_id = 'uuid' WHERE id = 'uuid';
