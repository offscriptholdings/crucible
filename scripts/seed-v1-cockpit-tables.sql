-- ================================================================
-- MTC-311: seed open_loops, protocols, people from data.js rows
-- Re-running is safe — idempotency guard skips if already applied.
-- ================================================================

DO $$
BEGIN
  IF (SELECT COUNT(*) FROM open_loops) > 0 THEN
    RAISE NOTICE 'MTC-311 seed already applied — skipping.';
    RETURN;
  END IF;

  -- -----------------------------------------------
  -- open_loops — from CX.loops in data.js
  -- -----------------------------------------------
  INSERT INTO open_loops (text, note, hot) VALUES
    ('Cap table v3 → Marcus',               'Waiting on you since Mon',       true),
    ('offscript pricing — lock the three tiers', 'Blocks the launch page',   true),
    ('Reply to Daniel re: the podcast slot', 'Read it Tuesday, never answered', false),
    ('Lease renewal — landlord needs an answer', 'He said Friday',           false);

  -- -----------------------------------------------
  -- protocols — from CX.protocols in data.js
  -- -----------------------------------------------
  INSERT INTO protocols (title, sub, kind) VALUES
    ('Strength block — Day 3 (Push)',        'Bench · overhead press · accessories', 'Training'),
    ('Morning light before the phone',       'Outside, ten minutes, no screen',      'Daily'),
    ('Reading — ''The Pattern Seekers'', Pt. II', 'A chapter a night',               'Mind'),
    ('Sabbath — Sunday, fully off',          'The one you keep skipping',            'Rhythm');

  -- -----------------------------------------------
  -- people (relationships) — from CX.people in data.js
  -- -----------------------------------------------
  INSERT INTO people (name, rel, temp, note) VALUES
    ('Hannah', 'Wife',         'close',    'Anniversary Saturday. Plan it today.'),
    ('Marcus', 'Partner, 98',  'tense',    'Waiting on the cap table since Monday.'),
    ('Dad',    'Family',       'warm',     'Lunch today. Ask about the knee.'),
    ('Daniel', 'Friend',       'drifting', 'You owe him a reply. Three days now.'),
    ('Priya',  'offscript',    'steady',   'Sent the intro — close the loop.');

END $$;
