---
name: classmates-teacher
description: |
  Build teacher-facing dashboard features for Southlodge Classmates v2 — roster management, progress views, assignments, and analytics. ALWAYS use this skill when working on ANY teacher-side functionality: dashboards, class management, pupil lists, progress reports, assignment creation, parent communication, admin settings, analytics views, or data visualization. Also trigger when user mentions: teacher dashboard, class roster, pupil progress, add pupils, manage class, generate reports, GDPR compliance, teacher login, magic link, KPIs, progress charts, assignment builder, or any Classmates feature accessed after teacher authentication. If working on Classmates and the feature is for teachers (not pupils playing games), READ THIS SKILL FIRST.
---

# Classmates Teacher Dashboard Skill

> A teacher at South Lodge Primary has 22 pupils on iPads with 30 minutes of IT time. The dashboard must give her everything she needs in that time — instantly, clearly, beautifully. Build to that standard.

## BEFORE YOU WRITE ANY CODE

This is a blocking requirement. You MUST complete these steps before writing a single line:

**STEP 1:** Read the design system reference: `references/design-system.md`
**STEP 2:** Read the privacy rules (they are NON-NEGOTIABLE): see PRIVACY section below
**STEP 3:** Read the accessibility requirements: see ACCESSIBILITY section below
**STEP 4:** Review the SHIPPING GATE checklist at the bottom — you will need to pass every item

If you skip these steps, you WILL miss requirements and waste the user's time. Do them now.

-----

## MANDATORY QUALITY RULES

### USE THE FULL POWER OF THE UI STACK

You have Recharts, Motion, Radix UI, Lucide, Sonner, and Tailwind. USE ALL OF THEM.

**Recharts** — Do not show raw numbers in a table when a chart tells the story better:
- LineChart for progress over time (per pupil or class aggregate)
- BarChart for comparing games (which is hardest, most played)
- AreaChart for engagement trends (games per day/week)
- Custom heatmap grid for pupil x game matrix
- ResponsiveContainer on every chart (never hardcode dimensions)
- Custom tooltips with context (not just the number)
- Animated transitions between data views

**Motion** — Do not render static pages:
- Page transitions (slide in from right, fade out)
- Staggered list animations (pupils appear one by one)
- Card reveals on load (scale from 0.95 + opacity)
- Number counters (animate from 0 to value)
- Expand/collapse transitions for drill-downs
- AnimatePresence for conditional content (modals, panels)
- Layout animations when items reorder (sort changes)

**Radix UI** — Do not build custom modals or dropdowns:
- Dialog for add/edit pupil forms
- AlertDialog for ALL destructive actions (delete, remove, reset)
- DropdownMenu for row actions (edit, delete, reset PIN, view progress)
- Tooltip for explaining icons, abbreviations, data points
- These are accessible by default — keyboard nav, ARIA, focus trap

**Lucide** — Do not use emoji or text for icons:
- Every action button has an icon + label
- Status indicators use icons (check, alert, clock)
- Navigation uses icons
- Empty states use large illustrative icons
- Consistent icon weight throughout

**Sonner** — Do not silently succeed or fail:
- Success toast on every create/update/delete
- Error toast with human-readable message on failure
- Loading toast for operations >500ms
- Promise toast pattern for async operations

### DATA PRESENTATION RULES

- **Show don't tell**: A chart beats a table. A table beats a paragraph.
- **Progressive disclosure**: Summary first, detail on click/expand
- **Comparative context**: "78% — above class average" not just "78%"
- **Temporal context**: "Last played yesterday" not "2026-04-08T14:30:00Z"
- **Action-oriented**: Every data point should suggest what to do next
- **Zero state guidance**: Empty screens guide the teacher to the first action

### WHAT "GOOD" LOOKS LIKE

The teacher dashboard should feel like:
- **Stripe Dashboard** — clean, data-dense, scannable
- **Linear** — fast, keyboard-navigable, responsive
- **Notion** — clear hierarchy, satisfying interactions

It should NOT feel like:
- A spreadsheet with CSS
- A form with a submit button
- A 2010-era admin panel

### NEVER SHIP

- A loading spinner without a skeleton placeholder
- A table that doesn't sort or filter
- An action with no feedback (toast)
- A destructive action without confirmation (AlertDialog)
- A modal that can't be closed with Escape
- A chart with no labels or legend
- Raw timestamps instead of relative time
- A page that only works on desktop

-----

## Current State

```
src/components/teacher/
  Dashboard.tsx      # 91 lines — 4 tabs (overview, pupils, progress, assign)
  Roster.tsx         # 122 lines — add/remove pupils, PIN management
  Progress.tsx       # 201 lines — class stats + per-pupil breakdown
  Assignments.tsx    # 153 lines — create/manage game assignments
```

### Known Gaps (fix these)
- No search/filter on roster
- No CSV bulk import
- Only 10 of 38 games in assignment dropdown
- No per-pupil drill-down with trend charts
- No PDF/CSV export
- No CfE curriculum mapping
- No class analytics (hardest game, engagement heatmap)
- No editable teacher profile
- Plain white/gray design — disconnected from premium pupil UI
- No skeleton loaders (just "Loading..." text)
- No toast notifications on actions
- Teacher dashboard should use teal/emerald accents to connect with pupil app

-----

## Database

```sql
-- All with Row Level Security, teachers see only their own data
teachers    (id, email, display_name, school_name, class_code, created_at)
pupils      (id, teacher_id, display_name, pin, avatar_config, created_at)
progress    (id, pupil_id, game_id, skill_id, score, stars, streak,
             best_streak, mastery_level, attempts, coins_earned,
             last_played_at, synced_at)
assignments (id, teacher_id, game_id, skill_id, message, active, created_at)
rewards     (id, pupil_id, coins, unlocked_items, equipped, achievements)
```

Supabase project: `mtlzmeyppmumbsjhsagq` (eu-west-2, PostgreSQL 17.6)

-----

## Feature Requirements

### Dashboard Overview
- KPI cards with animated counters: active today, games completed, avg score, needs attention
- Recent activity feed (last 10 game completions)
- Quick actions: add pupil, create assignment, view reports

### Roster
- Search by name (instant filter)
- Sort by name, last active, stars
- Bulk CSV import (FileReader API, parse, generate PINs, batch insert)
- Row actions via DropdownMenu: edit name, reset PIN, view progress, remove
- Inline edit for display name
- Empty state with clear CTA

### Progress
- Class summary: aggregate stars, games, active count
- Pupil table: sortable, filterable, clickable rows
- Pupil drill-down panel: per-game breakdown with stars, attempts, mastery
- Trend chart: LineChart showing progress over last 10 attempts per game
- Game comparison: BarChart of avg stars per game across class
- Engagement heatmap: pupils (rows) x games (columns), colour by mastery

### Assignments
- Full game list (all 38 games, not just 10)
- Level targeting (assign specific difficulty)
- Optional message to pupils
- Active/inactive toggle with toast feedback
- Delete with AlertDialog confirmation

### Reports (planned)
- Per-pupil PDF (browser print CSS or jspdf)
- Class summary PDF
- CfE coverage report
- CSV data export

-----

## PRIVACY RULES (NON-NEGOTIABLE)

These are legal requirements, not suggestions. Violating them risks the school's trust and GDPR compliance.

### Data Collection
- **Allowed**: display_name (chosen by teacher, can be initials), 4-digit PIN, game progress scores
- **NEVER collect**: real names, email addresses, dates of birth, photos, addresses, phone numbers, IP addresses, device identifiers
- **Display names**: teachers choose these — could be "Pupil A" or initials. Never prompt for "full name"

### Data Access
- All data scoped by Row Level Security (teachers see ONLY their own class)
- No data sharing between teachers or schools
- No analytics/tracking beyond game progress
- No PII in URLs, console logs, or error messages

### Data Lifecycle
- Cascade delete on pupil removal (progress, rewards — everything)
- No data retention after deletion
- Supabase in EU region (eu-west-2) for GDPR compliance

### Building Features
- Never build a feature that requires personal data
- Never log pupil data to console in production
- Never expose pupil IDs in URLs visible to other teachers
- Always use RLS — never bypass with service role key in client code
- File imports (CSV) must be processed client-side only — never upload to server

-----

## ACCESSIBILITY REQUIREMENTS (NON-NEGOTIABLE)

These ensure every teacher can use the dashboard regardless of ability.

### Keyboard Navigation
- Every interactive element reachable via Tab
- Enter/Space activates buttons and links
- Escape closes modals, dialogs, dropdowns
- Arrow keys navigate within menus and lists
- Visible focus indicators on all focusable elements (never `outline: none`)

### Screen Readers
- All images have alt text
- Form inputs have associated labels (htmlFor/id or aria-label)
- Dynamic content uses aria-live regions
- Icons have aria-hidden="true" when decorative, sr-only text when meaningful
- Use Radix UI primitives — they handle ARIA roles automatically

### Visual
- WCAG AA contrast ratios (4.5:1 for text, 3:1 for large text)
- Text resizable to 200% without breaking layout
- No information conveyed by colour alone (use icons + colour)
- Focus indicators visible in both light and dark themes

### Forms
- Error messages associated with inputs (aria-describedby)
- Required fields marked with both visual and ARIA indicators
- Submit buttons disabled during submission with loading state

-----

## SHIPPING GATE (MANDATORY)

You are NOT done until EVERY item below passes. Do NOT tell the user the work is complete until you have verified each one.

### Functional
- [ ] Feature works end-to-end (create, read, update, delete where applicable)
- [ ] Data loads from Supabase correctly
- [ ] Offline fallback works via Dexie
- [ ] No console errors in production build
- [ ] RLS policies enforced (tested with different teacher accounts if possible)

### Visual
- [ ] Uses Classmates design language (teal/emerald accents, dark theme options)
- [ ] Charts have labels, legends, and custom tooltips
- [ ] Tables are sortable and filterable
- [ ] Empty states guide users to first action
- [ ] Loading uses skeleton placeholders, not spinners
- [ ] Motion animations on page transitions and list items

### Interaction
- [ ] Every action gives feedback via Sonner toast
- [ ] Destructive actions require AlertDialog confirmation
- [ ] Forms validate before submission
- [ ] Modals closeable with Escape key

### Accessibility
- [ ] Tab navigation works through all interactive elements
- [ ] Screen reader tested (or Radix primitives used throughout)
- [ ] WCAG AA contrast ratios met
- [ ] Form labels associated with inputs
- [ ] Focus indicators visible

### Privacy
- [ ] No PII collected beyond display_name and PIN
- [ ] No pupil data logged to console
- [ ] RLS enforced on all queries
- [ ] Cascade delete works on pupil removal

### Integration
- [ ] Copyright header on every file
- [ ] Build passes: `npm run build`
- [ ] Component accessible from teacher dashboard navigation

-----

## References (optional lookup)

These files have detailed docs you can look up as needed:
- `references/design-system.md` — Colours, typography, layout, available components
- `references/teacher-needs.md` — Daily/weekly/termly teacher workflows and pain points
