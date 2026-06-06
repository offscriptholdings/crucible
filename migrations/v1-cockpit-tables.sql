-- ============================================================
-- MTC-311: Crucible v1 — add cockpit tables
-- Additive only — no DROPs.
-- Creates open_loops, protocols, people + anon read RLS.
-- ============================================================

-- open_loops: CX.loops shape — text, note, hot
CREATE TABLE open_loops (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text        TEXT NOT NULL,
    note        TEXT,
    hot         BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- protocols: CX.protocols shape — title, sub, kind
CREATE TABLE protocols (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT NOT NULL,
    sub         TEXT,
    kind        TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- people (relationships): CX.people shape — name, rel, temp, note
-- temp ∈ close|tense|warm|drifting|steady (matches data.js values)
CREATE TABLE people (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    rel         TEXT,
    temp        TEXT CHECK (temp IN ('close', 'tense', 'warm', 'drifting', 'steady')),
    note        TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- RLS: enable on all three; anon SELECT only
-- (service_role bypasses RLS by default — COS writes without a policy)
ALTER TABLE open_loops  ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols   ENABLE ROW LEVEL SECURITY;
ALTER TABLE people      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "open_loops_anon_read" ON open_loops FOR SELECT TO anon USING (true);
CREATE POLICY "protocols_anon_read"  ON protocols  FOR SELECT TO anon USING (true);
CREATE POLICY "people_anon_read"     ON people     FOR SELECT TO anon USING (true);
