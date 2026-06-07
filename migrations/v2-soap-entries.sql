-- MTC-313: soap_entries table — user-written SOAP journal
CREATE TABLE soap_entries (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date        DATE NOT NULL DEFAULT CURRENT_DATE,
    ref         TEXT,
    o           TEXT,
    a           TEXT,
    p           TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE soap_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "soap_entries_anon_read"
  ON soap_entries FOR SELECT TO anon USING (true);

CREATE POLICY "soap_entries_anon_insert"
  ON soap_entries FOR INSERT TO anon WITH CHECK (true);
