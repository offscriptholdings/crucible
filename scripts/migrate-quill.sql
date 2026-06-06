-- ================================================================
-- MTC-309: Crucible v1 — migrate Quill tasks + projects
-- One-time pull of quill.tasks (open) + quill.projects (active)
-- into public.tasks + public.projects.
-- Re-running is safe — idempotency guard skips if already applied.
-- ================================================================

DO $$
BEGIN
  -- Idempotency guard: skip if any active Quill project names already
  -- exist in public.projects (they can't be there except via this script).
  IF EXISTS (
    SELECT 1 FROM public.projects pp
    INNER JOIN quill.projects qp ON qp.name = pp.name
    WHERE qp.status = 'active'
  ) THEN
    RAISE NOTICE 'MTC-309 migration already applied — skipping.';
    RETURN;
  END IF;

  -- -------------------------------------------------------
  -- Step 1: Insert active Quill projects
  -- tint derived from quill domain (Quill design system palette)
  -- blurb from description, falling back to goal, then empty string
  -- -------------------------------------------------------
  INSERT INTO public.projects (name, tint, blurb)
  SELECT
    name,
    CASE domain
      WHEN 'spirit'  THEN '#4A5578'
      WHEN 'body'    THEN '#5F6E3C'
      WHEN 'work'    THEN '#8B5A3C'
      WHEN 'wealth'  THEN '#A57E2A'
      WHEN 'family'  THEN '#6E3F4A'
      WHEN 'home'    THEN '#7A9E6E'
      ELSE                '#888888'
    END,
    COALESCE(description, goal, '')
  FROM quill.projects
  WHERE status = 'active';

  -- -------------------------------------------------------
  -- Step 2: Insert open Quill tasks
  -- horizon derived from schedule_date / due_date (whichever is set):
  --   <= CURRENT_DATE          → 'today'  (today or overdue)
  --   <= CURRENT_DATE + 7 days → 'week'
  --   else / no date           → 'rest'
  -- project_id: FK to public.projects matched by quill project name.
  --   Tasks with no quill project_id get NULL project_id (allowed).
  -- done: always false (open tasks only)
  -- -------------------------------------------------------
  INSERT INTO public.tasks (text, project_id, horizon, done)
  SELECT
    qt.title,
    pp.id,
    CASE
      WHEN COALESCE(qt.schedule_date, qt.due_date) <= CURRENT_DATE
           THEN 'today'
      WHEN COALESCE(qt.schedule_date, qt.due_date) <= CURRENT_DATE + INTERVAL '7 days'
           THEN 'week'
      ELSE 'rest'
    END,
    FALSE
  FROM quill.tasks qt
  LEFT JOIN quill.projects qp ON qp.id = qt.project_id
  LEFT JOIN public.projects pp ON pp.name = qp.name
  WHERE qt.status = 'open';

END $$;
