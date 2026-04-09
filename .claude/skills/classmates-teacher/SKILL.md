---
name: classmates-teacher
description: |
  Build teacher-facing dashboard features for Southlodge Classmates v2 — roster management, progress views, assignments, and analytics. ALWAYS use this skill when working on ANY teacher-side functionality: dashboards, class management, pupil lists, progress reports, assignment creation, parent communication, admin settings, analytics views, or data visualization. Also trigger when user mentions: teacher dashboard, class roster, pupil progress, add pupils, manage class, generate reports, GDPR compliance, teacher login, magic link, KPIs, progress charts, assignment builder, or any Classmates feature accessed after teacher authentication. If working on Classmates and the feature is for teachers (not pupils playing games), READ THIS SKILL FIRST.
---

# Classmates Teacher Dashboard Skill

> Build intuitive, data-rich teacher tools for Scottish primary schools

## Quick Reference

| Task | Read First |
|------|-----------|
| Dashboard layout | `references/design-system.md` |
| Class management | `references/teacher-needs.md` |
| Progress views | `references/teacher-needs.md` |
| Privacy/GDPR | `references/privacy-rules.md` |
| Accessibility | `references/accessibility.md` |

-----

## Platform Overview

**Repo**: `github.com/Johnobhoy88/classmates-v2` (private)
**Deploy**: https://classmates-v2.vercel.app
**Supabase**: `mtlzmeyppmumbsjhsagq` (eu-west-2)

### Tech Stack

```
React 19.2.4 + TypeScript 6.0.2 + Vite 8.0.4
Tailwind CSS 4.2.2 + Motion (animations)
Radix UI (dialog, tooltip, dropdown, alert-dialog)
Recharts (data visualization)
Supabase (auth, database) + Dexie (offline)
```

### Auth Model

| Role | Auth Method | Access |
|------|------------|--------|
| Teacher | Magic link email | Full dashboard |
| Pupil | Class code + 4-digit PIN | Games only |

-----

## Workflow: RESEARCH -> DESIGN -> BUILD -> TEST -> REFINE -> DEPLOY

### Phase 1: RESEARCH

Before writing code:

1. **Check existing dashboard components**:
   ```bash
   ls src/components/teacher/
   ```
2. **Understand teacher needs** — read `references/teacher-needs.md`
3. **Check design system** — read `references/design-system.md`
4. **Review privacy requirements** — read `references/privacy-rules.md`

**Gate**: Feature scope understood, privacy requirements clear

### Phase 2: DESIGN

Present to user for approval:

- Feature layout and information hierarchy
- Data displayed and interactions
- Privacy considerations
- Mobile responsiveness approach

**Gate**: User approves design

### Phase 3: BUILD

1. Scaffold component with proper structure
2. Implement data fetching with loading states
3. Add interactions with feedback
4. Ensure accessibility
5. Handle errors gracefully

**Gate**: Feature compiles, no TypeScript errors

### Phase 4: TEST

```bash
npm run dev
# Navigate to teacher dashboard
# Test on tablet viewport (768px)
```

Check:

- Loads with skeleton/loading state
- Data displays correctly
- Actions provide feedback
- Works on tablet
- Keyboard accessible

**Gate**: All checks pass

### Phase 5: REFINE

- Is the information hierarchy clear?
- Are actions discoverable?
- Is feedback immediate?
- Does it reduce teacher cognitive load?

### Phase 6: DEPLOY

```bash
npm run lint
npm run build
git add -A
git commit -m "feat(teacher): add [feature name]"
git push origin master
```

-----

## Dashboard Architecture

### Current File Structure

```
src/components/teacher/
├── Dashboard.tsx      # Main tabbed interface (overview, pupils, progress, assign)
├── Roster.tsx         # Add/remove pupils, PIN management
├── Progress.tsx       # Class progress, per-pupil breakdown
└── Assignments.tsx    # Create/manage game assignments
```

### Database Schema

```sql
teachers    — id, email, display_name, school_name, class_code, created_at
pupils      — id, teacher_id, display_name, pin (4-char), avatar_config, created_at
progress    — id, pupil_id, game_id, skill_id, score, stars, streak,
              best_streak, mastery_level, attempts, coins_earned,
              last_played_at, synced_at
assignments — id, teacher_id, game_id, skill_id, message, active, created_at
rewards     — id, pupil_id, coins, unlocked_items, equipped, achievements
```

All tables have Row Level Security. Teachers see only their own class.

-----

## Key Features

### 1. Dashboard Overview

Top-level KPIs a teacher needs at a glance:

| KPI | Description |
|-----|-------------|
| Active pupils today | Count of pupils who played |
| Games completed | Total games finished today |
| Average score | Class average across activities |
| Alerts | Pupils needing attention |

### 2. Class Roster Management

| Action | Implementation |
|--------|---------------|
| Add pupil | Modal form, generate unique 4-digit PIN |
| Edit pupil | Inline or modal edit |
| Remove pupil | Confirm dialog (Radix AlertDialog) |
| Reset PIN | Generate new 4-digit PIN |
| Bulk import | CSV upload (planned) |

### 3. Progress Views

| View | Shows |
|------|-------|
| Class summary | Total stars, games played, active today |
| Pupil table | Per-pupil stars, games, last active, top game |
| Pupil detail | Per-game breakdown with stars, attempts, mastery |

### 4. Assignments

- Create assignments with specific games
- Optional message to pupils
- Toggle active/inactive
- Delete with confirmation

### 5. Reports (planned)

- Individual pupil reports (PDF via browser print)
- Class progress reports
- CfE coverage reports
- Data exports (CSV)

-----

## Design Principles

### 1. Information Hierarchy
- Most important data visible without scrolling
- Progressive disclosure for details
- Clear visual grouping

### 2. Reduce Cognitive Load
- Sensible defaults
- Batch actions for repetitive tasks
- Clear empty states with guidance

### 3. Fast Feedback
- Toast notifications for all actions (Sonner)
- Loading indicators for async operations
- Optimistic updates where safe

### 4. Mobile-Aware
- Teachers often use tablets
- Touch-friendly targets (44px min)
- Responsive tables (cards on mobile)

-----

## Component Patterns

### Toast Notifications

```tsx
import { toast } from 'sonner';

toast.success('Pupil added successfully');
toast.error('Failed to save changes');
toast.promise(savePupil(data), {
  loading: 'Saving...',
  success: 'Saved!',
  error: 'Failed to save'
});
```

### Confirmation Dialogs

Use Radix AlertDialog for destructive actions (remove pupil, delete assignment).

### Data Visualization

Use Recharts for:
- Progress over time (LineChart)
- Game difficulty comparison (BarChart)
- Engagement heatmap (custom grid)

-----

## Privacy and GDPR

**Critical**: All teacher features must follow GDPR requirements.

| Principle | Implementation |
|-----------|---------------|
| Data minimization | Only collect display_name + PIN (no personal data) |
| Purpose limitation | Use data only for education |
| Access control | Teachers see only their own class (RLS) |
| No PII | No pupil emails, no real names required |
| Offline-first | Data stays on device until synced |

See `references/privacy-rules.md` for full requirements.

-----

## Accessibility

All teacher features must be:

- Keyboard navigable
- Screen reader compatible
- WCAG AA color contrast
- Focus indicators visible
- Form labels associated

See `references/accessibility.md` for full checklist.

-----

## Quality Checklist

Before shipping teacher features:

- Feature works as expected
- Error states handled
- Loading states shown
- Empty states helpful
- Information hierarchy clear
- Actions discoverable
- Feedback immediate (toasts)
- Tablet-friendly (768px+)
- Only necessary data shown
- Access control verified (RLS)
- Keyboard navigable
- Color contrast passes
- TypeScript clean
- Lint passes
- Build succeeds
- Copyright header on every file
