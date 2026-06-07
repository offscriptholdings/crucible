-- MTC-314: add anon INSERT to notes — app capture requires write access.
-- Table created by MTC-315 (crucible-cos) with anon SELECT only.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'notes' AND policyname = 'notes_anon_insert'
  ) THEN
    CREATE POLICY "notes_anon_insert"
      ON notes FOR INSERT TO anon
      WITH CHECK (true);
  END IF;
END $$;
