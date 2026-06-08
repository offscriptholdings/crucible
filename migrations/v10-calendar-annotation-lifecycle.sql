-- ============================================================
-- MTC-352: calendar_events annotation lifecycle columns
-- Additive only — no DROPs, no alters to existing columns.
-- Adds: reviewed, annotated_at, reviewed_at
-- ============================================================

-- reviewed: flips true once David approves the annotation in a live session.
-- NOT NULL DEFAULT false — existing 57 rows backfill to false automatically via PostgreSQL DEFAULT mechanism.
-- COS must not overwrite annotations on a reviewed event.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'calendar_events'
      AND column_name = 'reviewed'
  ) THEN
    ALTER TABLE calendar_events ADD COLUMN reviewed BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- annotated_at: when the COS last wrote the annotation (used to detect stale drafts).
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'calendar_events'
      AND column_name = 'annotated_at'
  ) THEN
    ALTER TABLE calendar_events ADD COLUMN annotated_at TIMESTAMPTZ;
  END IF;
END $$;

-- reviewed_at: when David approved the annotation (optional — supports future audit trail).
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'calendar_events'
      AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE calendar_events ADD COLUMN reviewed_at TIMESTAMPTZ;
  END IF;
END $$;
