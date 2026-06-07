-- ============================================================
-- MTC-329: Crucible P3.7 — checklists schema
-- Templates + per-trip runs + calendar event link.
-- Additive only — no DROPs.
-- Depends on: domains table present in DB (v6-domains-schema.sql applied).
-- ============================================================

-- Step 1: Create checklists table (reusable template)
CREATE TABLE IF NOT EXISTS checklists (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT        NOT NULL,
    domain_id  UUID        REFERENCES domains(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Step 2: Create checklist_items table (template line items)
CREATE TABLE IF NOT EXISTS checklist_items (
    id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id  UUID    NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
    text          TEXT    NOT NULL,
    sort_order    INTEGER NOT NULL DEFAULT 0
);

-- Step 3: Create checklist_runs table (per-trip deploy, optionally linked to a calendar event)
CREATE TABLE IF NOT EXISTS checklist_runs (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id        UUID        NOT NULL REFERENCES checklists(id),
    calendar_event_id   UUID        REFERENCES calendar_events(id),
    for_date            DATE,
    archived            BOOLEAN     NOT NULL DEFAULT false,
    created_at          TIMESTAMPTZ DEFAULT now()
);

-- Step 4: Create checklist_run_items table (per-run item state — checks live here, never on the template)
CREATE TABLE IF NOT EXISTS checklist_run_items (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id      UUID    NOT NULL REFERENCES checklist_runs(id) ON DELETE CASCADE,
    text        TEXT    NOT NULL,
    checked     BOOLEAN NOT NULL DEFAULT false,
    sort_order  INTEGER NOT NULL DEFAULT 0
);

-- Step 5: RLS — enable on all 4 tables; anon SELECT on each (service role writes via bypass)
ALTER TABLE checklists          ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_runs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_run_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='checklists' AND policyname='checklists_anon_read') THEN
    CREATE POLICY "checklists_anon_read" ON checklists FOR SELECT TO anon USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='checklist_items' AND policyname='checklist_items_anon_read') THEN
    CREATE POLICY "checklist_items_anon_read" ON checklist_items FOR SELECT TO anon USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='checklist_runs' AND policyname='checklist_runs_anon_read') THEN
    CREATE POLICY "checklist_runs_anon_read" ON checklist_runs FOR SELECT TO anon USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='checklist_run_items' AND policyname='checklist_run_items_anon_read') THEN
    CREATE POLICY "checklist_run_items_anon_read" ON checklist_run_items FOR SELECT TO anon USING (true);
  END IF;
END $$;

-- Step 6: anon UPDATE on checklist_run_items — mirrors tasks.done pattern (v1-tasks-update-policy.sql)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='checklist_run_items' AND policyname='checklist_run_items_anon_update') THEN
    CREATE POLICY "checklist_run_items_anon_update" ON checklist_run_items
      FOR UPDATE TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Step 7: Seed 3 empty Home checklist templates (idempotent: per-name NOT EXISTS guard)
INSERT INTO checklists (name, domain_id)
SELECT v.name, d.id
FROM (VALUES
  ('Boat Day'),
  ('Camper — pre-trip prep'),
  ('Camper — pack')
) AS v(name)
CROSS JOIN (SELECT id FROM domains WHERE name = 'Home' LIMIT 1) AS d
WHERE NOT EXISTS (
  SELECT 1 FROM checklists c WHERE c.name = v.name
);
