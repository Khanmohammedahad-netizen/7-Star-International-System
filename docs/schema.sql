-- ═══════════════════════════════════════════════════════════
-- 7STAR OS — Event Command System — Database Schema
-- New tables only — does NOT modify existing billing tables
-- ═══════════════════════════════════════════════════════════

-- ── EVENTS ──
CREATE TABLE IF NOT EXISTS events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID NOT NULL,
  name                TEXT NOT NULL,
  type                TEXT NOT NULL DEFAULT 'corporate',
  status              TEXT NOT NULL DEFAULT 'planning',
  start_date          DATE NOT NULL,
  end_date            DATE NOT NULL,
  start_time          TIME,
  end_time            TIME,
  setup_date          DATE,
  breakdown_date      DATE,
  venue_name          TEXT,
  venue_address       TEXT,
  venue_city          TEXT DEFAULT 'Dubai',
  venue_country       TEXT DEFAULT 'UAE',
  client_id           UUID,
  coordinator_id      UUID,
  team_members        UUID[] DEFAULT '{}',
  expected_guests     INTEGER,
  actual_guests       INTEGER,
  budget_total        DECIMAL(15,2),
  color               TEXT DEFAULT '#C9A84C',
  notes               TEXT,
  internal_notes      TEXT,
  is_template         BOOLEAN DEFAULT FALSE,
  created_by          UUID,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── EVENT TIMELINE ITEMS ──
CREATE TABLE IF NOT EXISTS event_timeline_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL,
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  time            TIME NOT NULL,
  duration_mins   INTEGER DEFAULT 30,
  title           TEXT NOT NULL,
  category        TEXT DEFAULT 'general',
  description     TEXT,
  assigned_to     UUID[] DEFAULT '{}',
  vendor_id       UUID,
  status          TEXT DEFAULT 'pending',
  completed_at    TIMESTAMPTZ,
  completed_by    UUID,
  skip_reason     TEXT,
  position        INTEGER DEFAULT 0,
  is_critical     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── GLOBAL VENDOR DIRECTORY ──
CREATE TABLE IF NOT EXISTS event_vendors_directory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  contact_name    TEXT,
  phone           TEXT,
  email           TEXT,
  website         TEXT,
  address         TEXT,
  city            TEXT DEFAULT 'Dubai',
  country         TEXT DEFAULT 'UAE',
  rating          INTEGER,
  notes           TEXT,
  is_preferred    BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── EVENT VENDOR ASSIGNMENTS ──
CREATE TABLE IF NOT EXISTS event_vendor_assignments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID NOT NULL,
  event_id            UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  vendor_id           UUID NOT NULL REFERENCES event_vendors_directory(id) ON DELETE CASCADE,
  service_description TEXT,
  quoted_amount       DECIMAL(12,2),
  agreed_amount       DECIMAL(12,2),
  status              TEXT DEFAULT 'contacted',
  contract_url        TEXT,
  deposit_amount      DECIMAL(12,2),
  deposit_paid_at     TIMESTAMPTZ,
  notes               TEXT,
  arrival_time        TIME,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── EVENT EXPENSES ──
CREATE TABLE IF NOT EXISTS event_expenses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL,
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  vendor_id       UUID REFERENCES event_vendors_directory(id) ON DELETE SET NULL,
  category        TEXT NOT NULL,
  description     TEXT NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  currency        TEXT DEFAULT 'AED',
  status          TEXT DEFAULT 'pending',
  paid_at         TIMESTAMPTZ,
  payment_method  TEXT,
  receipt_url     TEXT,
  created_by      UUID,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── EVENT TASKS ──
CREATE TABLE IF NOT EXISTS event_tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL,
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT DEFAULT 'general',
  assignee_id     UUID,
  due_date        DATE,
  due_time        TIME,
  priority        TEXT DEFAULT 'medium',
  status          TEXT DEFAULT 'todo',
  completed_at    TIMESTAMPTZ,
  completed_by    UUID,
  position        INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── TIMELINE TEMPLATES ──
CREATE TABLE IF NOT EXISTS timeline_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL,
  name        TEXT NOT NULL,
  event_type  TEXT,
  items       JSONB NOT NULL DEFAULT '[]',
  created_by  UUID,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── EVENT NOTES ──
CREATE TABLE IF NOT EXISTS event_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL,
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_by  UUID,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── ROW LEVEL SECURITY ──
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_timeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_vendors_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_vendor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_notes ENABLE ROW LEVEL SECURITY;

-- ── INDEXES ──
CREATE INDEX IF NOT EXISTS idx_events_org         ON events(org_id);
CREATE INDEX IF NOT EXISTS idx_events_status      ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_date  ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_client      ON events(client_id);
CREATE INDEX IF NOT EXISTS idx_timeline_event     ON event_timeline_items(event_id);
CREATE INDEX IF NOT EXISTS idx_timeline_time      ON event_timeline_items(time);
CREATE INDEX IF NOT EXISTS idx_ev_vendors_event   ON event_vendor_assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_ev_vendors_vendor  ON event_vendor_assignments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_expenses_event     ON event_expenses(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_event        ON event_tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee     ON event_tasks(assignee_id);
