-- ============================================================
-- DeutschMeister — Schema v2 (star economy)
-- Run in Supabase SQL Editor. Safe to re-run: drops v1 tables.
-- ============================================================

drop table if exists public.speaking_submissions cascade;
drop table if exists public.repair_queue cascade;
drop table if exists public.session_tasks cascade;
drop table if exists public.daily_sessions cascade;
drop table if exists public.user_vocabulary cascade;
drop table if exists public.vocabulary_master cascade;
drop table if exists public.curriculum_days cascade;
drop table if exists public.level_tests cascade;
drop table if exists public.conversations cascade;
drop table if exists public.quizzes cascade;
drop table if exists public.practice_tasks cascade;
drop table if exists public.lessons cascade;
drop table if exists public.flashcards cascade;
drop table if exists public.vocabulary cascade;
drop table if exists public.grammar_topics cascade;
drop table if exists public.profiles cascade;

-- ------------------------------------------------------------
-- Enums
-- ------------------------------------------------------------
do $$ begin
  create type cefr_level as enum ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_kind as enum ('repair', 'vocabulary', 'lesson', 'production', 'speaking', 'closeout');
exception when duplicate_object then null; end $$;

do $$ begin
  create type word_kind as enum ('noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'number', 'phrase');
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------
-- USER STATE
-- ------------------------------------------------------------
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,

  current_level cefr_level default 'A1' not null,
  current_day int default 1 not null,          -- day number within the level
  session_hour int default 20 not null,        -- preferred study hour, 0-23

  total_points int default 0 not null,
  three_star_count int default 0 not null,     -- lifetime mastered tasks
  streak_count int default 0 not null,
  longest_streak int default 0 not null,
  last_session_date date,

  words_learned int default 0 not null,
  sessions_completed int default 0 not null,

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ------------------------------------------------------------
-- FIXED CONTENT (shared by every user, never AI-generated)
-- ------------------------------------------------------------

-- The curriculum: what happens on each day of each level
create table public.curriculum_days (
  id uuid default gen_random_uuid() primary key,
  level cefr_level not null,
  day_number int not null,
  title text not null,
  grammar_focus text,
  vocab_topic text not null,
  speaking_prompt text,
  production_prompt text,
  unique (level, day_number)
);

-- The master word list
create table public.vocabulary_master (
  id uuid default gen_random_uuid() primary key,
  level cefr_level not null,
  day_number int not null,
  german text not null,
  english text not null,
  article text check (article in ('der', 'die', 'das')),
  plural text,
  word_type word_kind not null,
  example_de text not null,
  example_en text not null,
  unique (level, german)
);

create index vocabulary_master_day_idx on public.vocabulary_master (level, day_number);

-- Grammar reference
create table public.grammar_topics (
  id uuid default gen_random_uuid() primary key,
  level cefr_level not null,
  slug text unique not null,
  title text not null,
  summary text not null,
  explanation text not null,
  examples jsonb default '[]' not null,
  common_mistakes jsonb default '[]' not null,
  sort_order int default 0 not null
);

-- ------------------------------------------------------------
-- PER-USER LEARNING STATE
-- ------------------------------------------------------------

-- Spaced repetition state, one row per user per word
create table public.user_vocabulary (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  word_id uuid references public.vocabulary_master(id) on delete cascade not null,

  ease_factor real default 2.5 not null,
  interval_days int default 0 not null,
  repetitions int default 0 not null,
  next_review date default current_date not null,
  last_review date,

  best_stars int default 0 not null check (best_stars between 0 and 3),
  times_correct int default 0 not null,
  times_wrong int default 0 not null,

  created_at timestamptz default now() not null,
  unique (user_id, word_id)
);

create index user_vocabulary_due_idx on public.user_vocabulary (user_id, next_review);

-- One session per user per calendar day
create table public.daily_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  session_date date default current_date not null,
  level cefr_level not null,
  day_number int not null,

  points_earned int default 0 not null,
  stars_earned int default 0 not null,
  tasks_total int default 6 not null,
  tasks_done int default 0 not null,
  completed boolean default false not null,

  created_at timestamptz default now() not null,
  unique (user_id, session_date)
);

-- The individual tasks inside a session
create table public.session_tasks (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.daily_sessions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,

  kind task_kind not null,
  position int not null,
  title text not null,

  score real,                                   -- 0.0 - 1.0
  stars int check (stars between 0 and 3),
  points int default 0 not null,
  completed boolean default false not null,
  payload jsonb default '{}' not null,          -- task-specific results

  completed_at timestamptz,
  created_at timestamptz default now() not null
);

create index session_tasks_session_idx on public.session_tasks (session_id, position);

-- Anything scored under 2 stars comes back until it clears
create table public.repair_queue (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,

  source_kind task_kind not null,
  word_id uuid references public.vocabulary_master(id) on delete cascade,
  grammar_slug text,
  description text not null,

  stars_when_queued int not null check (stars_when_queued between 0 and 3),
  attempts int default 0 not null,
  cleared boolean default false not null,
  cleared_at timestamptz,

  created_at timestamptz default now() not null
);

create index repair_queue_open_idx on public.repair_queue (user_id, cleared);

-- Speaking analysis results
create table public.speaking_submissions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  session_task_id uuid references public.session_tasks(id) on delete cascade,

  prompt text not null,
  transcript text,
  duration_seconds real,
  words_per_minute real,

  grammar_score real,
  vocabulary_score real,
  fluency_score real,
  stars int check (stars between 0 and 3),
  corrections jsonb default '[]' not null,
  feedback text,

  created_at timestamptz default now() not null
);

-- Level completion tests and certificates
create table public.level_tests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  level cefr_level not null,

  reading_score real,
  listening_score real,
  writing_score real,
  speaking_score real,
  overall_score real,

  average_stars real,
  certificate_tier text check (certificate_tier in ('Bestanden', 'Gut', 'Sehr gut', 'Ausgezeichnet')),
  exam_ready boolean default false not null,
  passed boolean default false not null,

  taken_at timestamptz default now() not null
);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.user_vocabulary enable row level security;
alter table public.daily_sessions enable row level security;
alter table public.session_tasks enable row level security;
alter table public.repair_queue enable row level security;
alter table public.speaking_submissions enable row level security;
alter table public.level_tests enable row level security;
alter table public.curriculum_days enable row level security;
alter table public.vocabulary_master enable row level security;
alter table public.grammar_topics enable row level security;

-- Own data only
create policy "own profile read"   on public.profiles for select using (auth.uid() = id);
create policy "own profile write"  on public.profiles for update using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);

create policy "own vocab"     on public.user_vocabulary       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own sessions"  on public.daily_sessions        for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own tasks"     on public.session_tasks         for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own repair"    on public.repair_queue          for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own speaking"  on public.speaking_submissions  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own tests"     on public.level_tests           for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Fixed content is readable by any signed-in user
create policy "curriculum readable" on public.curriculum_days    for select using (auth.role() = 'authenticated');
create policy "words readable"      on public.vocabulary_master  for select using (auth.role() = 'authenticated');
create policy "grammar readable"    on public.grammar_topics     for select using (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- LEADERBOARDS (public view, no personal data beyond name)
-- ------------------------------------------------------------
create or replace view public.leaderboard as
select
  p.id,
  coalesce(p.full_name, 'Anonym') as display_name,
  p.current_level,
  p.total_points,
  p.three_star_count,
  p.streak_count,
  coalesce((
    select sum(s.points_earned)
    from public.daily_sessions s
    where s.user_id = p.id
      and s.session_date >= date_trunc('week', current_date)::date
  ), 0) as points_this_week
from public.profiles p;

-- ------------------------------------------------------------
-- Auto-create profile on signup
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
