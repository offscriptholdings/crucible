-- MTC-319: cos_session_requests + cos_session_log — pull model COS-trigger schema.
-- App inserts a pending request; box poller picks it up, flips status, writes log.
-- anon: INSERT + SELECT cos_session_requests; SELECT cos_session_log.
-- Service role (box/poller): UPDATE cos_session_requests + INSERT cos_session_log (bypasses RLS).

CREATE TABLE cos_session_requests (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status       TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'running', 'done', 'error')),
    started_at   TIMESTAMPTZ,
    finished_at  TIMESTAMPTZ,
    summary      TEXT,
    error        TEXT
);

ALTER TABLE cos_session_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cos_session_requests_anon_select"
    ON cos_session_requests FOR SELECT TO anon USING (true);

CREATE POLICY "cos_session_requests_anon_insert"
    ON cos_session_requests FOR INSERT TO anon WITH CHECK (true);

-- append-only progress log; one row per line the COS session emits.
-- Ordered by ts. Realtime subscription-ready for MTC-321 with no schema change.
CREATE TABLE cos_session_log (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES cos_session_requests(id) ON DELETE CASCADE,
    ts         TIMESTAMPTZ NOT NULL DEFAULT now(),
    line       TEXT NOT NULL
);

ALTER TABLE cos_session_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cos_session_log_anon_select"
    ON cos_session_log FOR SELECT TO anon USING (true);
