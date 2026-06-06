-- ============================================================
-- MTC-303: Crucible v1 schema
-- Drops all old personal-OS public tables; creates 4 v1 tables.
-- chaos.* and foundry_* are not touched.
-- ============================================================

-- -------------------------------------------------------
-- Phase 1: DROP old crucible-specific tables (CASCADE handles FKs)
-- Do NOT drop: foundry_health, foundry_queue, foundry_inflight,
--              foundry_reviews, foundry_deploys (Foundry state mirror)
-- -------------------------------------------------------
DROP TABLE IF EXISTS staged_reminders CASCADE;
DROP TABLE IF EXISTS relationship_events CASCADE;
DROP TABLE IF EXISTS protocol_logs CASCADE;
DROP TABLE IF EXISTS protocol_transitions CASCADE;
DROP TABLE IF EXISTS tenant_checkins CASCADE;
DROP TABLE IF EXISTS lease_events CASCADE;
DROP TABLE IF EXISTS property_maintenance CASCADE;
DROP TABLE IF EXISTS people CASCADE;
DROP TABLE IF EXISTS protocols CASCADE;
DROP TABLE IF EXISTS leases CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS queue CASCADE;
DROP TABLE IF EXISTS body_scans CASCADE;
DROP TABLE IF EXISTS body_metrics CASCADE;
DROP TABLE IF EXISTS body_targets CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS daily_briefs CASCADE;
DROP TABLE IF EXISTS soap_entries CASCADE;
DROP TABLE IF EXISTS weight_log CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS supplements CASCADE;
DROP TABLE IF EXISTS open_loops CASCADE;
DROP TABLE IF EXISTS brief_conversations CASCADE;

-- -------------------------------------------------------
-- Phase 2: CREATE v1 tables (derived from data.js shapes)
-- -------------------------------------------------------

-- projects: { name, tint, blurb }
CREATE TABLE projects (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    tint        TEXT,
    blurb       TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- tasks: { text, project_id, horizon ∈ today|week|rest, done }
CREATE TABLE tasks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text        TEXT NOT NULL,
    project_id  UUID REFERENCES projects(id),
    horizon     TEXT NOT NULL CHECK (horizon IN ('today', 'week', 'rest')),
    done        BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- brief: { for_date, ref, verse, close }
CREATE TABLE brief (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    for_date    DATE NOT NULL UNIQUE,
    ref         TEXT,
    verse       TEXT,
    close       TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- calendar_events: { for_date, day_label, time, title, src, about, prep, who, thread }
CREATE TABLE calendar_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    for_date    DATE NOT NULL,
    day_label   TEXT,
    time        TEXT,
    title       TEXT NOT NULL,
    src         TEXT NOT NULL CHECK (src IN ('personal', '98', 'offscript')),
    about       TEXT,
    prep        TEXT,
    who         TEXT,
    thread      TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------
-- Phase 3: RLS — enable on all 4 tables; anon SELECT only
-- (service_role bypasses RLS by default — no write policy needed)
-- -------------------------------------------------------
ALTER TABLE projects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief           ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_anon_read"        ON projects        FOR SELECT TO anon USING (true);
CREATE POLICY "tasks_anon_read"           ON tasks           FOR SELECT TO anon USING (true);
CREATE POLICY "brief_anon_read"           ON brief           FOR SELECT TO anon USING (true);
CREATE POLICY "calendar_events_anon_read" ON calendar_events FOR SELECT TO anon USING (true);
