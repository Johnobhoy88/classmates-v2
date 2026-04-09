---
name: classmates-teacher
description: |
  Build teacher-facing dashboard features for Southlodge Classmates v2 — roster management, progress views, assignments, and analytics. ALWAYS use this skill when working on ANY teacher-side functionality: dashboards, class management, pupil lists, progress reports, assignment creation, parent communication, admin settings, analytics views, or data visualization. Also trigger when user mentions: teacher dashboard, class roster, pupil progress, add pupils, manage class, generate reports, GDPR compliance, teacher login, magic link, KPIs, progress charts, assignment builder, or any Classmates feature accessed after teacher authentication. If working on Classmates and the feature is for teachers (not pupils playing games), READ THIS SKILL FIRST.
---

# Classmates Teacher Dashboard Skill

> A teacher at South Lodge Primary has 22 pupils on iPads with 30 minutes of IT time. The dashboard must give her everything she needs in that time — instantly, clearly, beautifully. Build to that standard.

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
├── Dashboard.tsx      # 91 lines — 4 tabs (overview, pupils, progress, assign)
├── Roster.tsx         # 122 lines — add/remove pupils, PIN management
├── Progress.tsx       # 201 lines — class stats + per-pupil breakdown
└── Assignments.tsx    # 153 lines — create/manage game assignments
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

### Analytics (planned)
- Game difficulty ranking (avg stars across class)
- Engagement trends (games per day over 30 days)
- Intervention flags (pupils stuck below 1 star)
- Most/least played games

-----

## Privacy — NON-NEGOTIABLE

- No pupil emails, real names, DOB, or addresses collected
- Display names chosen by teacher (could be initials)
- All data scoped by RLS (teachers see only their class)
- Cascade delete on pupil removal
- No analytics/tracking beyond game progress
- No data sharing between teachers/schools
- No PII in URLs or console logs
- Supabase in EU region (GDPR compliant)

See `references/privacy-rules.md` for complete rules.

-----

## Accessibility — NON-NEGOTIABLE

- Keyboard navigable (Tab, Enter, Escape, Arrow keys)
- Screen reader compatible (ARIA labels, roles, live regions)
- WCAG AA contrast ratios
- Visible focus indicators
- Form labels associated with inputs
- Use Radix UI primitives (accessible by default)

See `references/accessibility.md` for complete checklist.

-----

## References

- `references/design-system.md` — Colours, typography, layout, components
- `references/teacher-needs.md` — Daily/weekly/termly teacher workflows
- `references/privacy-rules.md` — GDPR, data minimization, RLS
- `references/accessibility.md` — WCAG AA, keyboard nav, screen readers
