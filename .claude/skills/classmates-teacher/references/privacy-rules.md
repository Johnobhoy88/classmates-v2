# Privacy and GDPR Rules

Classmates is privacy-first by design. These rules are non-negotiable.

## What We Collect

| Data | Stored? | Why |
|------|---------|-----|
| Teacher email | Yes | Magic link auth only |
| Teacher display name | Yes | Dashboard greeting |
| School name | Yes | Branding |
| Pupil display name | Yes | Class roster (first name only, teacher's choice) |
| Pupil PIN | Yes | Login (4 digits, not a password) |
| Game scores/stars | Yes | Progress tracking |
| Streaks/mastery | Yes | Learning analytics |
| Coins | Yes | Gamification |

## What We Do NOT Collect

- Pupil email addresses
- Pupil real names (display name is teacher's choice — could be initials)
- Pupil date of birth
- Pupil home address
- Device identifiers
- IP addresses
- Cookies (beyond session)
- Analytics/tracking pixels
- Third-party data sharing

## Row Level Security

All Supabase tables have RLS policies:
- Teachers see only their own record and their own pupils
- Pupils can only see their own progress
- Anonymous pupil login via class code + PIN (no Supabase auth account)

## Data Retention

- Progress data: Retained while pupil is active
- Deleted pupil: Cascade deletes all progress, assignments, rewards
- No soft delete currently (consider adding for accident recovery)

## GDPR Compliance

- **Right to access**: Teacher can view all pupil data in dashboard
- **Right to erasure**: Remove pupil = all data deleted (cascade)
- **Data portability**: CSV export (planned feature)
- **Lawful basis**: Legitimate interest (educational tool used by school)
- **Data processor**: Supabase (EU region, GDPR compliant)
- **No marketing**: Zero marketing emails, zero tracking

## Rules for Building Features

1. Never add fields that collect personal pupil data
2. Never add analytics/tracking beyond game progress
3. Never share data between teachers/schools
4. Never expose pupil data in URLs
5. Always use Supabase RLS — never bypass with service key on client
6. Always cascade delete when removing a pupil
7. Reports should use display names only, never infer real identity
