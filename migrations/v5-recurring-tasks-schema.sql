-- ============================================================
-- MTC-323: Crucible P3.1 — recurring/seasonal tasks schema
-- Additive only — no DROPs.
-- ============================================================

-- Step 1: Add due_date to tasks (nullable, additive)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'due_date'
  ) THEN
    ALTER TABLE tasks ADD COLUMN due_date date;
  END IF;
END $$;

-- Step 2: Create recurring_tasks table
CREATE TABLE IF NOT EXISTS recurring_tasks (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    text        TEXT    NOT NULL,
    project_id  UUID    REFERENCES projects(id),
    due_month   INTEGER NOT NULL CHECK (due_month BETWEEN 1 AND 12),
    due_day     INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
    recurrence  TEXT    NOT NULL DEFAULT 'annual',
    start_year  INTEGER,
    active      BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Step 3: RLS
ALTER TABLE recurring_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recurring_tasks_anon_read" ON recurring_tasks FOR SELECT TO anon USING (true);

-- Step 4: Seed Bermuda Lawn Care annual schedule
-- Guard: only insert if no Bermuda rows exist yet (safe re-run)
INSERT INTO recurring_tasks (text, project_id, due_month, due_day, recurrence, start_year, active)
SELECT v.text, p.id, v.due_month, v.due_day, 'annual', v.start_year, true
FROM (VALUES
  ('🌱 Spring pre-emergent (prodiamine)', 3,  1,  NULL::integer),
  ('🌱 Spring green-up + first fertilizer', 4, 10, NULL),
  ('🌱 May fertilizer',                     5, 10, 2027),
  ('🌱 June lawn feeding',                  6, 10, NULL),
  ('🌱 July lawn feeding',                  7, 10, NULL),
  ('🌱 August lawn feeding',                8, 10, NULL),
  ('🌱 Fall pre-emergent + stop feeding',   9, 15, NULL)
) AS v(text, due_month, due_day, start_year)
CROSS JOIN (SELECT id FROM projects WHERE name = 'Bermuda Lawn Care' LIMIT 1) AS p
WHERE NOT EXISTS (
  SELECT 1 FROM recurring_tasks r
  JOIN projects pr ON r.project_id = pr.id
  WHERE pr.name = 'Bermuda Lawn Care'
);
