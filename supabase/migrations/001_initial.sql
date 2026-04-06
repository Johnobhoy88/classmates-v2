-- Classmates V2 — Initial Schema
-- Privacy-first: no pupil personal data, only display names and game progression

-- Teachers authenticate via magic link
create table teachers (
  id uuid primary key default auth.uid(),
  email text not null unique,
  display_name text,
  school_name text default 'My School',
  class_code text unique,
  created_at timestamptz default now()
);

-- Generate a short class code from teacher ID
create or replace function generate_class_code()
returns trigger as $$
begin
  new.class_code := upper(substring(replace(new.id::text, '-', '') from 1 for 6));
  return new;
end;
$$ language plpgsql;

create trigger set_class_code
  before insert on teachers
  for each row execute function generate_class_code();

-- Pupils: created by teachers, identified by display name + PIN
create table pupils (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references teachers(id) on delete cascade,
  display_name text not null,
  pin char(4) not null,
  avatar_config jsonb default '{}',
  created_at timestamptz default now(),
  unique(teacher_id, pin)
);

-- Game progression — the only data stored per pupil
create table progress (
  id uuid primary key default gen_random_uuid(),
  pupil_id uuid not null references pupils(id) on delete cascade,
  game_id text not null,
  skill_id text default 'general',
  score int default 0,
  stars int default 0,
  streak int default 0,
  best_streak int default 0,
  mastery_level int default 0,
  attempts int default 0,
  coins_earned int default 0,
  last_played_at timestamptz default now(),
  synced_at timestamptz,
  unique(pupil_id, game_id, skill_id)
);

-- Assignments from teacher
create table assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references teachers(id) on delete cascade,
  game_id text not null,
  skill_id text,
  message text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Unlockables (coins, cosmetics, achievements)
create table rewards (
  id uuid primary key default gen_random_uuid(),
  pupil_id uuid unique not null references pupils(id) on delete cascade,
  coins int default 0,
  unlocked_items jsonb default '[]',
  equipped jsonb default '{}',
  achievements jsonb default '[]'
);

-- Row Level Security
alter table teachers enable row level security;
alter table pupils enable row level security;
alter table progress enable row level security;
alter table assignments enable row level security;
alter table rewards enable row level security;

-- Teachers can only see their own record
create policy "teachers_own" on teachers
  for all using (auth.uid() = id);

-- Teachers can manage their own pupils
create policy "teachers_manage_pupils" on pupils
  for all using (teacher_id = auth.uid());

-- Allow anonymous pupil lookup by class_code + pin
create policy "pupil_pin_login" on pupils
  for select using (true);

-- Progress: teachers see their pupils, pupils see own
create policy "progress_teacher" on progress
  for all using (
    pupil_id in (select id from pupils where teacher_id = auth.uid())
  );

create policy "progress_anon_read" on progress
  for select using (true);

create policy "progress_anon_insert" on progress
  for insert with check (true);

create policy "progress_anon_update" on progress
  for update using (true);

-- Assignments: teachers manage own
create policy "assignments_teacher" on assignments
  for all using (teacher_id = auth.uid());

create policy "assignments_anon_read" on assignments
  for select using (true);

-- Rewards: linked to pupil
create policy "rewards_access" on rewards
  for all using (true);

-- Indexes
create index idx_pupils_teacher on pupils(teacher_id);
create index idx_pupils_pin on pupils(teacher_id, pin);
create index idx_progress_pupil on progress(pupil_id);
create index idx_progress_game on progress(pupil_id, game_id);
create index idx_assignments_teacher on assignments(teacher_id);
