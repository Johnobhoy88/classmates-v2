# Classmates v2

## What This Is

Educational gaming platform for South Lodge Primary School, Invergordon, Scotland.
Built by John McMillan (HighlandAI). Free, privacy-first, no ads, no tracking.

**Owner:** John McMillan, HighlandAI (UTR: 7756096104)
**License:** CC BY-NC 4.0 — copyright headers on every source file
**Contact:** jpmcmillan67@gmail.com
**Repo:** github.com/Johnobhoy88/classmates-v2 (private)

## Tech Stack

- **Frontend:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4
- **Game engines:** Phaser 3 (spelling), Three.js (3D racing)
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **Offline:** Dexie (IndexedDB), auto-sync every 30 seconds
- **Auth:** Supabase magic link (teachers), class code + 4-digit PIN (pupils)
- **Audio:** Procedural Web Audio API (zero audio files)
- **Hosting:** Vercel (free tier)
- **Cost:** £0/month

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
└── hooks/                     # useAuth, useOffline, useProgress
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

- **Supabase:** Schema designed, migration file ready. Needs: create project, run migration, set env vars
- **Vercel:** vercel.json configured. Needs: connect repo, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- **Env vars:** .env.example has placeholders. Real creds go in Vercel env vars, not committed

## Coding Conventions

- Commit style: imperative, descriptive (e.g. "Fix all TypeScript strict errors for Vercel production build")
- No stubs or placeholders — every file is real, functional code
- Games use QuizEngine where possible; standalone React state for interactive games
- Content data in src/game/content/, procedural generation for maths/fractions/sequences
- Copyright header on every .ts/.tsx file (HighlandAI, CC BY-NC 4.0)
- Do not add features beyond what's asked. Keep it simple.

## Product Context

- Built for a real school (South Lodge Primary, Invergordon, Highland)
- Target: Scottish primary schools that can't afford Sumdog (£600-900/year)
- Competitive advantage: zero friction onboarding, privacy-first, free
- Future direction: CfE curriculum mapping, parent-facing features, freemium (£30/year premium)
- ~2,000 primary schools in Scotland, reachable via 32 local authorities
- Key funding source for schools: Pupil Equity Fund (PEF), ~£1,225/eligible pupil
