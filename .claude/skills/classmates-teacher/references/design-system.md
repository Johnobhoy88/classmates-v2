# Teacher Dashboard Design System

## Colour Palette

Teacher UI uses a professional but warm palette that connects to the pupil-facing app:

- **Primary**: Teal/emerald (`teal-600`, `emerald-500`) — same as pupil app
- **Background**: Light gray (`gray-50`) with white cards
- **Text**: `gray-900` primary, `gray-500` secondary
- **Success**: `emerald-500`
- **Warning**: `amber-500`
- **Danger**: `red-500`
- **Stars**: `amber-400`

## Typography

- Font: Nunito (same as pupil app, loaded via Google Fonts)
- Headings: `font-bold`
- Body: `text-sm` to `text-base`
- Data: `tabular-nums` for numbers

## Components Available

### From Radix UI (installed)
- `@radix-ui/react-dialog` — modals
- `@radix-ui/react-alert-dialog` — confirmations
- `@radix-ui/react-tooltip` — hover info
- `@radix-ui/react-dropdown-menu` — action menus

### From Sonner (installed)
- `toast()` — notifications

### From Recharts (installed)
- `LineChart` — progress over time
- `BarChart` — game comparisons
- `PieChart` — category breakdowns
- `ResponsiveContainer` — auto-sizing

### From Motion (installed)
- `motion.div` — animated containers
- `AnimatePresence` — enter/exit animations
- Page transitions

### From Lucide React (installed)
- 1,500+ icons for actions, status, navigation

## Layout Patterns

- Max width: `max-w-4xl` or `max-w-7xl` depending on content
- Card padding: `p-4` to `p-6`
- Card radius: `rounded-2xl`
- Card shadow: `shadow-sm` or `shadow-lg` for elevated
- Gap between cards: `gap-4` to `gap-6`
- Responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`

## Current Teacher Components

- Dashboard.tsx (91 lines) — 4 tabs: overview, pupils, progress, assign
- Roster.tsx (122 lines) — add/remove pupils with PINs
- Progress.tsx (201 lines) — class stats + per-pupil breakdown
- Assignments.tsx (153 lines) — create/manage game assignments
