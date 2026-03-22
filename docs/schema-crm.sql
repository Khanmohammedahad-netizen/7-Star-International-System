-- ── COMPANIES ──
CREATE TABLE companies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  website      TEXT,
  industry     TEXT,
  size         TEXT,    -- startup | small | medium | large | enterprise
  revenue      BIGINT,  -- annual revenue in cents
  currency     TEXT DEFAULT 'USD',
  country      TEXT,
  city         TEXT,
  phone        TEXT,
  email        TEXT,
  description  TEXT,
  owner_id     UUID REFERENCES user_profiles(id),
  tags         TEXT[] DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── CONTACTS ──
CREATE TABLE contacts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name   TEXT NOT NULL,
  last_name    TEXT,
  email        TEXT,
  phone        TEXT,
  title        TEXT,
  company_id   UUID REFERENCES companies(id) ON DELETE SET NULL,
  source       TEXT,   -- web | referral | cold_outreach | social | event | other
  status       TEXT DEFAULT 'active',  -- active | inactive | prospect | customer
  owner_id     UUID REFERENCES user_profiles(id),
  avatar_url   TEXT,
  notes        TEXT,
  tags         TEXT[] DEFAULT '{}',
  last_contacted_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── PIPELINES ──
CREATE TABLE pipelines (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name         TEXT NOT NULL DEFAULT 'Sales Pipeline',
  is_default   BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── PIPELINE STAGES ──
CREATE TABLE pipeline_stages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id  UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  position     INTEGER NOT NULL,
  color        TEXT DEFAULT '#94A3B8',
  win_probability INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── DEALS ──
CREATE TABLE deals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  contact_id      UUID REFERENCES contacts(id) ON DELETE SET NULL,
  company_id      UUID REFERENCES companies(id) ON DELETE SET NULL,
  pipeline_id     UUID REFERENCES pipelines(id),
  stage_id        UUID REFERENCES pipeline_stages(id),
  value           DECIMAL(15,2) DEFAULT 0,
  currency        TEXT DEFAULT 'USD',
  probability     INTEGER DEFAULT 0,
  expected_close  DATE,
  closed_at       DATE,
  owner_id        UUID REFERENCES user_profiles(id),
  status          TEXT DEFAULT 'open',
    -- open | won | lost | on_hold
  lost_reason     TEXT,
  notes           TEXT,
  tags            TEXT[] DEFAULT '{}',
  position        INTEGER DEFAULT 0,  -- for kanban ordering
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── ACTIVITIES ──
CREATE TABLE activities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
    -- email | call | meeting | note | task | whatsapp | linkedin
  title        TEXT NOT NULL,
  description  TEXT,
  contact_id   UUID REFERENCES contacts(id) ON DELETE SET NULL,
  company_id   UUID REFERENCES companies(id) ON DELETE SET NULL,
  deal_id      UUID REFERENCES deals(id) ON DELETE SET NULL,
  owner_id     UUID REFERENCES user_profiles(id),
  due_at       TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT FALSE,
  outcome      TEXT,  -- for calls/meetings
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── CONTACT TAGS (lookup) ──
CREATE TABLE tags (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name    TEXT NOT NULL,
  color   TEXT DEFAULT '#94A3B8',
  UNIQUE(org_id, name)
);

-- ── ROW LEVEL SECURITY ──
ALTER TABLE companies      ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags           ENABLE ROW LEVEL SECURITY;

-- Org isolation policy (apply to all tables)
CREATE POLICY "org_isolation_companies" ON companies
  FOR ALL USING (org_id IN (
    SELECT org_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "org_isolation_contacts" ON contacts
  FOR ALL USING (org_id IN (
    SELECT org_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "org_isolation_deals" ON deals
  FOR ALL USING (org_id IN (
    SELECT org_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "org_isolation_activities" ON activities
  FOR ALL USING (org_id IN (
    SELECT org_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "org_isolation_pipelines" ON pipelines
  FOR ALL USING (org_id IN (
    SELECT org_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "org_isolation_stages" ON pipeline_stages
  FOR ALL USING (org_id IN (
    SELECT org_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "org_isolation_tags" ON tags
  FOR ALL USING (org_id IN (
    SELECT org_id FROM memberships WHERE user_id = auth.uid()
  ));

-- ── INDEXES ──
CREATE INDEX idx_contacts_org       ON contacts(org_id);
CREATE INDEX idx_contacts_company   ON contacts(company_id);
CREATE INDEX idx_contacts_owner     ON contacts(owner_id);
CREATE INDEX idx_contacts_email     ON contacts(email);
CREATE INDEX idx_deals_org          ON deals(org_id);
CREATE INDEX idx_deals_stage        ON deals(stage_id);
CREATE INDEX idx_deals_contact      ON deals(contact_id);
CREATE INDEX idx_activities_org     ON activities(org_id);
CREATE INDEX idx_activities_contact ON activities(contact_id);
CREATE INDEX idx_activities_deal    ON activities(deal_id);
