# Classmates — Future Ideas & Features

> Parking lot for ideas. Not committed to any of these yet.
> Review after current rebuild is polished and stable.

---

## Pupil Buddy (Tamagotchi-Style Avatar)

- Persistent companion character that follows the pupil on every screen
- Feed it, dress it, buy clothes/accessories with earned coins (coin economy finally has a use)
- Buddy reacts to gameplay: happy when you get streaks, sleepy if you haven't played today, excited for new games
- Unlockable outfits/hats/accessories as rewards for mastery milestones
- Buddy visible on results screen, home screen, even loading states
- Could be pixel art style (LittleJS?) or animated SVG
- Gives the coin/rewards system a purpose beyond a number going up
- Buddy evolves/grows as pupil progresses (egg → baby → teen → adult)

## Content / Curriculum

- **Project Packs**: Cross-curricular topic packs built around real school projects
  - Vikings (history + geography + literacy + art)
  - WW1/WW2 (history + maths + reading comprehension)
  - Space (science + maths + geography)
  - Scottish History (Bannockburn, Highland Clearances, devolution)
  - Rainforests, Ancient Egypt, Romans — whatever P4-P7 classes actually cover
  - Liaise with South Lodge teachers to find out what projects they run each term
  - Each pack = themed questions across multiple game types, unified visual theme
- **CfE Mapping**: Tag every game and question to Curriculum for Excellence codes
- **Seasonal Events**: Christmas maths, Burns Night poetry, Scottish Book Week reading challenges
- **Teacher Content Editor**: Let teachers add their own spelling words, topic questions — no code needed

## Teacher Features

- **Alternative Methods Library**: Show teachers different approaches to the same concept
  - Japanese multiplication (line method) vs UK long multiplication
  - Chunking vs bus stop division
  - Number bonds visual methods (bar models, part-whole)
  - Singapore maths bar modelling
  - Each method: short visual explainer + "Try it in class" activity suggestion
  - NOT a training course — just a quick reference card teachers can glance at
  - Pupils could optionally see "another way to solve this" hints in-game
- **Method Toggle**: Let teachers choose which methods are shown to their class
- **Parent Portal**: Read-only view for parents (class code + parent PIN), see their child's stars/progress
- **Assembly Mode**: Full-screen leaderboard display for school assemblies (celebration of effort)
- **Intervention Alerts**: Flag pupils who haven't played in X days or are stuck below 1 star

## Wellbeing & Citizenship (Research Needed)

- Research how Scottish schools deliver Health & Wellbeing (HWB) in CfE
- HWB is one of the 8 CfE curriculum areas — it's mandatory, not optional
- Possible angles:
  - Emotions vocabulary games (identify/name feelings)
  - Conflict resolution scenarios (choose-your-own-adventure style)
  - Growth mindset messaging (integrated into game feedback, not a separate module)
  - Anti-bullying awareness quizzes
  - Online safety / digital citizenship
- IMPORTANT: Get teacher input before building anything here — sensitive area
- Could be as simple as positive reinforcement language in existing games
- Buddy pet could tie into this — caring for something, responsibility

## Game Ideas

- **Story Mode**: Connected narrative across games — pupils complete a "quest" that spans spelling, maths, geography. Like a campaign mode.
- **Classroom Bingo**: Teacher shows answers on screen, pupils mark off questions they know. Supabase Realtime.
- **Escape Room**: Solve puzzles from different subjects to "unlock" doors. Timer-based, team or solo.
- **Code Breaker**: Crack a cipher using maths answers as keys. Each correct answer reveals a letter.
- **Map Explorer**: Interactive Scotland/UK/World map. Click regions, answer questions about them. Use SVG maps.
- **Music Maker**: Simple Incredibox-style loop builder as a reward for finishing games. Procedural Web Audio.
- **Build a Castle**: Answer questions to earn bricks. Class builds a shared castle together over a week. Supabase Realtime.
- **Godot 4 3D Game** (future): If we ever need a 3D showpiece beyond Three.js. Godot exports to HTML5, free, open source. NOT Unreal — Unreal has no web export and pixel streaming needs expensive GPU servers.

## Design / UX

- **Themes**: Let pupils pick a theme (space, ocean, forest, castle) that skins the whole app
- **Dark Mode**: For older pupils / teacher preference
- **Accessibility**: High contrast mode, dyslexia-friendly font option, screen reader support
- **Sound Settings**: Volume slider, mute toggle, music on/off separate from SFX
- **Onboarding Tour**: First-time animated walkthrough for teachers (3 screens max)

## Technical / Infrastructure

- **Godot 4** (HTML5 export) as future 3D engine if Three.js isn't enough
- **Cloudflare Durable Objects** if we ever need true real-time multiplayer physics (racing etc)
- **Supabase Edge Functions** for server-side score validation (anti-cheat for leaderboards)
- **Image CDN**: If we add sprite assets, serve via Vercel CDN not Supabase Storage
- **Bundle Optimization**: Get initial bundle back to ~150KB (currently 226KB after Motion/Radix added to core)

## Monetisation / Growth

- **Classmates Home** (parent app): £2-3/month for parents to see progress, set practice goals, unlock extra games at home
- **School Premium**: £30/year for PDF reports, CfE exports, custom content editor, priority support
- **Highland Schools Network**: Get 5 Highland schools using it, then approach Highland Council education team
- **Digital Xtra Fund Grant**: Apply once we have 5+ schools and can show impact data
- **Glow Listing**: Get listed on Scotland's national education platform for distribution
- **Conference Demo**: Present at Scottish Learning Festival or ASE Scotland

## Wild Ideas (Maybe Crazy)

- **AI Tutor**: Use Claude API to explain wrong answers in kid-friendly language. "You picked 7, but 3+5=8. Think of it like having 3 apples and getting 5 more!"
- **Voice Input**: Speech recognition for spelling games — say the word instead of typing it
- **AR Mode**: Point tablet camera at a worksheet, overlay interactive hints (way future)
- **Pupil-Created Games**: Let older pupils (P6-P7) create simple quiz games for younger ones using a basic editor
- **School vs School**: Anonymous leaderboards between schools (opt-in). "South Lodge vs Invergordon Primary this week"
- **Physical Reward Integration**: Teachers scan a QR code to award a physical sticker when a pupil hits 3 stars
