-- ============================================================
-- MTC-340: Crucible P3.13a — brief.passage_ref + brief.passage
-- Additive only — no DROPs, no alters to existing columns.
-- The brief stays a single verse (ref + verse fields unchanged).
-- SOAP's "S" gets the fuller ESV passage the verse sits in.
-- ============================================================

-- Step 1: Add passage_ref column (the SOAP reference the COS picks)
-- Nullable TEXT, default NULL — the COS writes this (MTC-343).
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'brief'
      AND column_name = 'passage_ref'
  ) THEN
    ALTER TABLE brief ADD COLUMN passage_ref TEXT;
  END IF;
END $$;

-- Step 2: Add passage column (the exact ESV text for passage_ref)
-- Nullable TEXT, default NULL — the n8n ESV-fetch workflow writes this (MTC-341).
-- Includes verse numbers + ESV short-copyright line per ticket.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'brief'
      AND column_name = 'passage'
  ) THEN
    ALTER TABLE brief ADD COLUMN passage TEXT;
  END IF;
END $$;
