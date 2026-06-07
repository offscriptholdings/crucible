-- ============================================================
-- MTC-325: Crucible P3.3 — domains schema + seed + assign existing
-- Additive + targeted UPDATE + DROP tint (confirmed unused in app code).
-- ============================================================

-- Step 1: Create domains table
CREATE TABLE IF NOT EXISTS domains (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT        NOT NULL UNIQUE,
    color      TEXT        NOT NULL,
    sort_order INTEGER     NOT NULL DEFAULT 0,
    blurb      TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Step 2: RLS on domains (anon SELECT; service role writes via bypass)
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'domains' AND policyname = 'domains_anon_read'
  ) THEN
    CREATE POLICY "domains_anon_read" ON domains FOR SELECT TO anon USING (true);
  END IF;
END $$;

-- Step 3: Seed 8 domains (idempotent — skip on name conflict)
INSERT INTO domains (name, color, sort_order, blurb)
VALUES
  ('Ventures', '#e36a2c', 1, 'My own — things I have equity in (Meridian, Offscript, Foundry, Chaos/trading)'),
  ('98H',      '#3cc870', 2, 'W-2 — 98 Holdings (employer, no equity)'),
  ('Crucible', '#6a9de3', 3, 'Personal operating system'),
  ('Home',     '#7A9E6E', 4, 'House, yard, vehicles'),
  ('Rental',   '#B8A68C', 5, 'Rental property (empty for now)'),
  ('Faith',    '#C8A060', 6, 'Scripture, church, small group'),
  ('Body',     '#4A9E8A', 7, 'Training / protocols'),
  ('People',   '#E87C5E', 8, 'Relationships')
ON CONFLICT (name) DO NOTHING;

-- Step 4: Add domain_id to projects
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'domain_id'
  ) THEN
    ALTER TABLE projects ADD COLUMN domain_id UUID REFERENCES domains(id);
  END IF;
END $$;

-- Step 5: Add domain_id to tasks (loose tasks set it directly; project-linked tasks inherit via project)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'domain_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN domain_id UUID REFERENCES domains(id);
  END IF;
END $$;

-- Step 6: Add domain_id to open_loops
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'open_loops' AND column_name = 'domain_id'
  ) THEN
    ALTER TABLE open_loops ADD COLUMN domain_id UUID REFERENCES domains(id);
  END IF;
END $$;

-- Step 7: Assign domain_id to named projects (by name match, idempotent)
UPDATE projects SET domain_id = (SELECT id FROM domains WHERE name = '98H')
  WHERE name = '98H' AND domain_id IS NULL;

UPDATE projects SET domain_id = (SELECT id FROM domains WHERE name = 'Home')
  WHERE name = 'Bermuda Lawn Care' AND domain_id IS NULL;

UPDATE projects SET domain_id = (SELECT id FROM domains WHERE name = 'Ventures')
  WHERE name = 'Chaos' AND domain_id IS NULL;

UPDATE projects SET domain_id = (SELECT id FROM domains WHERE name = 'Crucible')
  WHERE name = 'Crucible' AND domain_id IS NULL;

UPDATE projects SET domain_id = (SELECT id FROM domains WHERE name = 'Ventures')
  WHERE name = 'Foundry' AND domain_id IS NULL;

-- Step 8: Assign domain_id to named loose tasks (exact text match, idempotent)
UPDATE tasks SET domain_id = (SELECT id FROM domains WHERE name = 'Ventures')
  WHERE text = 'Change Haven Moving Co name to Meridian Tech Co' AND domain_id IS NULL;

UPDATE tasks SET domain_id = (SELECT id FROM domains WHERE name = 'Ventures')
  WHERE text = 'Meridian Tech Co site: update services + bio copy' AND domain_id IS NULL;

UPDATE tasks SET domain_id = (SELECT id FROM domains WHERE name = 'Home')
  WHERE text = 'Wash truck' AND domain_id IS NULL;

UPDATE tasks SET domain_id = (SELECT id FROM domains WHERE name = 'Faith')
  WHERE text = 'Write up part for small group' AND domain_id IS NULL;

-- Step 9: Retire projects.tint — superseded by domain.color; no app code references it
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'tint'
  ) THEN
    ALTER TABLE projects DROP COLUMN tint;
  END IF;
END $$;
