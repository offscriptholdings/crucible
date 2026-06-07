# crucible

Crucible — iPad-first personal command center (render app). Vite + React 18 PWA. Reads Supabase; kept dumb. The COS writes; the app reads.

## Stack

- Vite 6 + React 18 (JSX, not TypeScript)
- CSS custom properties (design tokens) — no Tailwind, no CSS-in-JS
- @supabase/supabase-js v2 (read-only, anon key)
- vite-plugin-pwa (PWA shell + service worker)
- No test suite — Playwright golden path via `~/Developer/foundry/scripts/playwright-verify.mjs`

## Supabase

Project: `dbnkkournwhgnguugbnq`  
Env vars: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`  
Client: `src/lib/supabase.js`

The app has READ-ONLY access via the anon key. All writes go through the COS (`crucible-cos` repo). Do not add write operations except `tasks.done` (the sole app-write, MTC-307).

## Design system

Token file: `src/styles/tokens.css` (CSS custom properties — ported verbatim from `crucible-rebuild-docs/crucible-v6/project/styles.css`)  
Font stack: Newsreader (serif) · IBM Plex Sans (sans) · IBM Plex Mono (mono) — loaded via Google Fonts in `index.html`  
Palette: slate `#1f2a30` bg · parchment `#ece5d3` ink · rubric `#e36a2c` accent  
No Tailwind. Use `var(--token-name)` for all colors, radii, shadows, and type.

## Conventions

- JSX files: `.jsx` extension (not `.tsx`, no TypeScript)
- CSS: CSS custom properties + utility classes from `src/styles/tokens.css`
- Components: PascalCase filenames in `src/components/`
- Data layer: `src/lib/supabase.js` for all Supabase queries — import this file, do not instantiate a second client
- Assets: `public/` for static files, `src/assets/` for imported assets
- No inline styles except for dynamic values calculated in JS
- No comments unless the WHY is non-obvious

## Breakpoints

- iPhone (≈390–430px): bottom TabBar, single-column today feed
- iPad mini (≈744px portrait / 1133px landscape): vertical NavRail, 2-column cockpit — **PRIMARY TARGET**
- iPad (≈1024–1366px landscape): vertical NavRail, 3-column cockpit

## App reads; COS writes (the law)

The render app is dumb. It reads from Supabase and displays. It never writes `brief`, `calendar_events`, or `projects` — those are COS-written.

Exceptions: `tasks.done` — the Tasks tab writes check-off state (MTC-307). `soap_entries` INSERT — the SOAP tab writes user journal entries (MTC-313). `notes` INSERT — the Notes tab captures notes (MTC-314). `cos_session_requests` INSERT — the Ask-Crucible pill triggers a COS session (MTC-317). `chaos.signals.action` UPDATE — the Chaos tab marks take/pass on signals (MTC-318).

## Vercel

Project: `crucible-2` (team: off-script-holdings-projects, `team_uUZ09QMGB45Mrwcax8BV3atx`)  
Production URL: `crucible-hguy.vercel.app`  
Env vars needed on Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (required before MTC-306 runs)

## Foundry integration

Tenant: offscript · GitHub: `offscriptholdings/crucible`  
Branch protection: `foundry/reviewer` required before merge  
Auto-merge: yes (send-it) by default
