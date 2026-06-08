-- ============================================================
-- MTC-332: Crucible P3.10 — staged_items schema + scoped cos_session_requests
-- The COS curates staged_items (service role writes); the app reads.
-- Dispositions flow through cos_session_requests.scope (anon INSERT) — no direct
-- anon write on staged_items.
-- Additive only — no DROPs, no alters to existing columns.
-- ============================================================

-- Step 1: Create staged_items table (COS-curated agenda)
CREATE TABLE IF NOT EXISTS staged_items (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    kind         TEXT        NOT NULL
                   CHECK (kind IN (
                     'note_triage', 'checklist_proposal', 'recurring_due',
                     'loop_nudge', 'brief_followup', 'other'
                   )),
    title        TEXT        NOT NULL,
    detail       TEXT,
    ref          JSONB,
    dispositions TEXT[]      NOT NULL DEFAULT '{}',
    status       TEXT        NOT NULL DEFAULT 'staged'
                   CHECK (status IN ('staged', 'acting', 'done', 'dismissed')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at  TIMESTAMPTZ
);

-- Step 2: RLS on staged_items — anon SELECT only
-- COS (service role) bypasses RLS for writes; no anon write policy is intentional.
ALTER TABLE staged_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='staged_items'
      AND policyname='staged_items_anon_select'
  ) THEN
    CREATE POLICY "staged_items_anon_select"
      ON staged_items FOR SELECT TO anon USING (true);
  END IF;
END $$;

-- Step 3: Extend cos_session_requests with scope column (additive, nullable)
-- Null = normal full session (existing behavior unchanged).
-- Non-null = scoped micro-session (e.g. {"staged_item_id":"...","disposition":"approve"}).
-- The existing anon_insert policy (WITH CHECK (true)) already covers this column.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cos_session_requests'
      AND column_name = 'scope'
  ) THEN
    ALTER TABLE cos_session_requests ADD COLUMN scope JSONB;
  END IF;
END $$;
