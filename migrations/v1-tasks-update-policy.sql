-- MTC-307: allow anon to toggle tasks.done (the sole app-write)
CREATE POLICY "anon can update task done" ON public.tasks
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);
