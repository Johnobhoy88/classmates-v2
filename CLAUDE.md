# Classmates v2

## What This Is

Educational gaming platform for South Lodge Primary School, Invergordon, Scotland.
Built by John McMillan (HighlandAI). Free, privacy-first, no ads, no tracking.

**Owner:** John McMillan, HighlandAI (UTR: 7756096104)
**License:** CC BY-NC 4.0 — copyright headers on every source file
**Contact:** jpmcmillan67@gmail.com
**Repo:** github.com/Johnobhoy88/classmates-v2 (private)

## Tech Stack

### Core
- **Frontend:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **Offline:** Dexie (IndexedDB), auto-sync every 30 seconds
- **Auth:** Supabase magic link (teachers), class code + 4-digit PIN (pupils)
- **Audio:** Procedural Web Audio API (zero audio files)
- **Hosting:** Vercel (free tier)
- **Cost:** £0/month

### Game Engines (all installed, code-split, loaded on demand)
- **Phaser 3** — immersive spelling game (existing)
- **Three.js** — 3D racing game (existing)
- **Kaplay.js** — 2D platformer/puzzle games (MIT, ~200KB)
- **LittleJS** — ultra-tiny pixel art engine (MIT, ~10KB)
- **Nostalgist.js** — browser RetroArch emulator for GB ROMs (MIT)
- **GDExporter** — CLI for exporting GDevelop games to HTML5 (dev dependency)
- **Godot 4.4** — 3D/2D game engine, exports to HTML5/WASM (MIT, free). Claude writes .tscn scenes and .gd scripts directly. Headless CLI verified. For showpiece 3D games (platformers, physics puzzles, adventures) that go beyond Three.js.

### UI/UX Libraries (all installed)
- **Motion** (was framer-motion) — page transitions, animations, game menus (MIT)
- **Lucide React** — 1,500+ SVG icons, tree-shakable (ISC)
- **Radix UI** — accessible dialog, tooltip, dropdown primitives (MIT)
- **Sonner** — toast notifications, 1KB (MIT)
- **Recharts** — lightweight charts for teacher analytics (MIT)
- **vite-plugin-pwa** — service worker, offline install, asset caching

### Level Design (JSON-based, Claude can write directly)
- **LDtk** format — level JSON for platformers (Claude writes .ldtk files)
- **Tiled** format — tilemap JSON for 2D games (Claude writes .tmj files)
- **Kenney assets** — 60,000+ sprites/tiles/audio (CC0, buy All-in-1 for £16)

## Build & Run

```bash
npm install
npm run dev      # local dev server
npm run build    # production build (tsc + vite)
npm run lint     # eslint
npm run preview  # preview production build
```

Build must pass `tsc -b && vite build` cleanly. Initial bundle target: ~147KB gzipped.

## Project Structure

```
src/
├── App.tsx                    # Root router (landing/dashboard/pupil home)
├── main.tsx                   # Entry point
├── components/
│   ├── auth/                  # AuthProvider, TeacherLogin, PupilLogin
│   ├── games/                 # 32 game files (38 playable games)
│   ├── pupil/Home.tsx         # Game catalog grid
│   ├── teacher/               # Dashboard, Roster, Progress, Assignments
│   └── shared/                # QuizEngine, GameShell, LevelSelect, Landing, Layout
├── data/
│   ├── supabase.ts            # Supabase client + types
│   ├── db.ts                  # Dexie IndexedDB schema
│   └── sync.ts                # Auto-sync to cloud
├── game/
│   ├── content/               # 15 data files (~1,700 lines of curriculum content)
│   ├── scenes/SpellingScene.ts # Phaser spelling game (404 lines)
│   └── systems/               # ProgressTracker, AudioSystem
├── hooks/                     # useAuth, useOffline, useProgress
└── utils/                     # shuffle, stars, sanitize (shared utilities)
```

## Architecture Patterns

- **Offline-first:** All game results write to Dexie immediately, sync to Supabase every 30s
- **Code-split:** Games lazy-loaded via React.lazy + Suspense
- **QuizEngine:** Shared component for all quiz-type games (scoring, stars, streaks, progress)
- **GameShell:** Phaser wrapper for immersive games
- **No audio files:** All SFX generated procedurally via Web Audio API

## Games (38 total)

- **Literacy (12):** Spelling, Phonics, Vocab, Grammar, Rhyming, Punctuation, Word Families, Dictation, Missing Vowels, Anagrams, Sentences, Reading
- **Numeracy (14):** Maths, Bonds, Times Tables, Fractions, Money, Time, Place Value, Missing Number, Shapes, Measurement, Word Problems, Speed Maths, Data Handling, Sequences
- **Geography (6):** Capitals, Continents, Weather, Compass, Flags, Scotland Quiz
- **Challenge (6):** Memory Match, Spelling Bee, Typing Speed, Daily Challenge, Head to Head (2-player), Southlodge Racers (Three.js 3D)

## Database (5 tables)

- **teachers** — email, school_name, auto-generated class_code
- **pupils** — display_name + 4-digit PIN per teacher (no personal data)
- **progress** — score, stars (0-3), streak, mastery (0-3), attempts, coins per game
- **assignments** — teacher-created game assignments with messages
- **rewards** — coins, unlocked items, achievements

All tables have RLS policies. Schema in `supabase/migrations/001_initial.sql`.

## Scoring System

- Stars: 0-3 (≥30% = 1, ≥60% = 2, ≥90% = 3)
- Mastery: 0-3 (based on stars + repeated attempts)
- Coins: 1-10 per game (star-based + perfect bonus)

## Infrastructure Status

- **Supabase:** LIVE — project `mtlzmeyppmumbsjhsagq` (eu-west-2), PostgreSQL 17.6, all 5 tables with RLS, migration applied
- **Vercel:** LIVE — project `classmates-v2` linked and deploying from master
- **Env vars:** .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Vercel env vars configured.
- **Auth:** Supabase magic link (teachers), class code + 4-digit PIN (pupils)

## Coding Conventions

- Commit style: imperative, descriptive (e.g. "Fix all TypeScript strict errors for Vercel production build")
- No stubs or placeholders — every file is real, functional code
- Games use QuizEngine where possible; standalone React state for interactive games
- Shared utilities in src/utils/ — use shuffle(), calcStars(), sanitizeHtml() instead of inlining
- Content data in src/game/content/, procedural generation for maths/fractions/sequences
- Copyright header on every .ts/.tsx file (HighlandAI, CC BY-NC 4.0)
- Do not add features beyond what's asked. Keep it simple.

## Product Context

- Built for a real school (South Lodge Primary, Invergordon, Highland)
- Target: Scottish primary schools that can't afford Sumdog (£600-900/year)
- Competitive advantage: zero friction onboarding, privacy-first, free
- ~2,000 primary schools in Scotland, reachable via 32 local authorities
- Key funding source for schools: Pupil Equity Fund (PEF), ~£1,225/eligible pupil

## Competition (Scottish EdTech)

- **Sumdog** (Edinburgh): Market leader, £600-900/year, CfE-aligned. Teachers say too complex.
- **Purple Mash**: £450-950/year, CfE-mapped. Expensive for small schools.
- **EducationCity**: Retired August 2025. Schools that used it need alternatives.
- **Seesaw**: No free tier. School/district license only.
- **Glow**: Free national platform but teachers mostly just use it for email.
- **Our edge**: Zero friction, free, privacy-first, one tool covering many subjects.

## Monetisation Strategy (Future)

- **Phase 1 (now):** Free. Grow to 5-10 Highland schools via word-of-mouth.
- **Phase 2 (traction):** Apply to Digital Xtra Fund for grant. Get listed on Glow. Add CfE mapping.
- **Phase 3 (income):** Freemium — free for schools, parents pay £2-3/month for "Classmates Home" (progress reports, practice at home). OR £30/year premium per school (PDF reports, CfE exports, custom questions). Head teachers can approve from PEF without council procurement.

## Next Phase: Game Engine Expansion

Researched and planned (April 2026). The next evolution beyond quiz games:

### Engines to Add
- **LittleJS** (~10KB, MIT): Ultra-tiny pixel art engine. Add retro platformers with near-zero bundle impact.
- **Kaplay.js** (~200KB, MIT): Easy 2D game framework for platformers/puzzle games. Works with Vite.
- **GB Studio** (free, MIT): Visual Game Boy ROM maker. Create educational adventures, embed via Nostalgist.js. Kids play a real Game Boy game in the browser.
- **Nostalgist.js** (MIT): Browser-based RetroArch emulator. Plays GB Studio ROMs in React.

### Supabase Realtime (already in free tier)
- **Broadcast**: Low-latency pub/sub for live classroom competitions (Kahoot-style)
- **Presence**: Track who's online, who's ready to play
- Upgrade Head to Head from local 2-player to class-wide live quiz
- No new infrastructure needed — already included in Supabase

### Supabase Limits to Watch
- Free tier pauses after 7 days inactivity (summer holidays = risk). Pro is $25/month.
- Edge Functions: 500K calls/month (enough if used sparingly)
- Realtime: 200 concurrent connections, 2M messages/month (fine for 2-3 classes)
- Storage: 1GB/2GB bandwidth (use Vercel CDN for static assets instead)

### Build Priority
1. **Live Classroom Quiz** — Supabase Realtime Broadcast + Presence (free, already available)
2. **Kaplay.js Platformer** — spelling/maths platformer prototype
3. **GB Studio Adventure** — "South Lodge Spelling Quest" as a Game Boy game
4. **Phaser 4 upgrade** — same API, better performance, when stable
