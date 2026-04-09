-- REPAIR MIGRATION: Ensure org_id exists and apply RBAC
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- This script safely adds missing columns to existing tables and then sets up RLS/RBAC.

-- 1. CLENTS Table Repair
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='org_id') THEN
        ALTER TABLE clients ADD COLUMN org_id UUID;
    END IF;
END $$;

-- 2. EVENTS Table Repair
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='org_id') THEN
        ALTER TABLE events ADD COLUMN org_id UUID;
    END IF;
END $$;

-- 3. VENDORS Table Repair
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vendors' AND column_name='org_id') THEN
        ALTER TABLE vendors ADD COLUMN org_id UUID;
    END IF;
END $$;

-- 4. FINANCES Table Repair
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='finances' AND column_name='org_id') THEN
        ALTER TABLE finances ADD COLUMN org_id UUID;
    END IF;
END $$;

-- 5. Memberships Table (Core infrastructure)
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, organization_id)
);

-- 6. Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE finances ENABLE ROW LEVEL SECURITY;

-- 7. Define Permissive Policies (Stabilization Phase)
-- These allow access based on authenticated role while we transition to full org-isolation.
DROP POLICY IF EXISTS "Permissive Org Access" ON vendors;
CREATE POLICY "Permissive Org Access" ON vendors FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permissive Client Access" ON clients;
CREATE POLICY "Permissive Client Access" ON clients FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permissive Event Access" ON events;
CREATE POLICY "Permissive Event Access" ON events FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permissive Finance Access" ON finances;
CREATE POLICY "Permissive Finance Access" ON finances FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 8. Future-Proofing: Define Org-Specific Policies (commented out until you have organization_ids set)
/*
CREATE POLICY "Org Isolation for Vendors" ON vendors
    FOR ALL USING (org_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));
*/
