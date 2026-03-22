-- =====================================================
-- MVP Skeleton Core — Multi-Tenant Schema
-- =====================================================
-- Run this in your Supabase SQL Editor

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slug        TEXT UNIQUE NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. User Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL,
    full_name   TEXT,
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. Memberships (user ↔ organization with role)
CREATE TABLE IF NOT EXISTS memberships (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role            TEXT NOT NULL DEFAULT 'member'
                    CHECK (role IN ('super_admin', 'admin', 'member', 'viewer')),
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, organization_id)
);

-- 4. Audit Log
CREATE TABLE IF NOT EXISTS audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action          TEXT NOT NULL,
    resource        TEXT NOT NULL,
    resource_id     TEXT,
    metadata        JSONB,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- 5. Example Items (module-level table)
CREATE TABLE IF NOT EXISTS example_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'inactive', 'archived')),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- 6. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    message         TEXT,
    is_read         BOOLEAN DEFAULT false,
    link_url        TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE example_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can read orgs they belong to
CREATE POLICY "Members can view their organizations"
    ON organizations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM memberships
            WHERE memberships.organization_id = organizations.id
            AND memberships.user_id = auth.uid()
        )
    );

-- Users can read their own memberships
CREATE POLICY "Users can view own memberships"
    ON memberships FOR SELECT
    USING (user_id = auth.uid());

-- Org-scoped read for example items
CREATE POLICY "Members can view org example items"
    ON example_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM memberships
            WHERE memberships.organization_id = example_items.organization_id
            AND memberships.user_id = auth.uid()
        )
    );

-- Org-scoped insert for example items
CREATE POLICY "Members can create org example items"
    ON example_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM memberships
            WHERE memberships.organization_id = example_items.organization_id
            AND memberships.user_id = auth.uid()
        )
    );

-- Users can read own notifications
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());
