-- DeutschMeister Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- User profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  current_level text default 'A1' check (current_level in ('A1', 'A2', 'B1', 'B2')),
  daily_goal_minutes int default 90,
  streak_count int default 0,
  last_active_date date,
  total_xp int default 0,
  words_learned int default 0,
  lessons_completed int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Vocabulary words
create table public.vocabulary (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  german_word text not null,
  english_word text not null,
  example_sentence text,
  example_translation text,
  word_type text check (word_type in ('noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'phrase', 'other')),
  gender text check (gender in ('der', 'die', 'das', null)),
  plural_form text,
  level text default 'A1' check (level in ('A1', 'A2', 'B1', 'B2')),
  created_at timestamptz default now()
);

-- Flashcards (spaced repetition)
create table public.flashcards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  vocabulary_id uuid references public.vocabulary(id) on delete cascade not null,
  ease_factor real default 2.5,
  interval_days int default 1,
  repetitions int default 0,
  next_review_date date default current_date,
  last_review_date date,
  created_at timestamptz default now()
);

-- Daily lessons
create table public.lessons (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_date date default current_date,
  lesson_type text not null check (lesson_type in ('grammar', 'speaking', 'listening', 'reading', 'writing', 'mixed')),
  title text not null,
  content jsonb not null default '{}',
  level text default 'A1' check (level in ('A1', 'A2', 'B1', 'B2')),
  duration_minutes int default 30,
  completed boolean default false,
  score int,
  created_at timestamptz default now()
);

-- Grammar topics
create table public.grammar_topics (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  level text not null check (level in ('A1', 'A2', 'B1', 'B2')),
  content jsonb not null default '{}',
  common_mistakes jsonb default '[]',
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Practice tasks / homework
create table public.practice_tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  task_type text not null check (task_type in ('translation', 'fill_blank', 'writing', 'grammar', 'listening', 'speaking')),
  prompt text not null,
  correct_answer text,
  user_answer text,
  ai_feedback text,
  is_correct boolean,
  completed boolean default false,
  lesson_id uuid references public.lessons(id) on delete set null,
  created_at timestamptz default now()
);

-- Weekly progress quizzes
create table public.quizzes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  quiz_date date default current_date,
  level text not null check (level in ('A1', 'A2', 'B1', 'B2')),
  total_questions int not null,
  correct_answers int not null,
  score_percentage real,
  weak_areas jsonb default '[]',
  recommendations jsonb default '[]',
  created_at timestamptz default now()
);

-- Conversation history
create table public.conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  scenario text,
  messages jsonb not null default '[]',
  corrections jsonb default '[]',
  duration_seconds int,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.vocabulary enable row level security;
alter table public.flashcards enable row level security;
alter table public.lessons enable row level security;
alter table public.practice_tasks enable row level security;
alter table public.quizzes enable row level security;
alter table public.conversations enable row level security;

-- RLS Policies: users can only access their own data
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Users can manage own vocabulary" on public.vocabulary for all using (auth.uid() = user_id);
create policy "Users can manage own flashcards" on public.flashcards for all using (auth.uid() = user_id);
create policy "Users can manage own lessons" on public.lessons for all using (auth.uid() = user_id);
create policy "Users can manage own tasks" on public.practice_tasks for all using (auth.uid() = user_id);
create policy "Users can manage own quizzes" on public.quizzes for all using (auth.uid() = user_id);
create policy "Users can manage own conversations" on public.conversations for all using (auth.uid() = user_id);

-- Grammar topics are readable by everyone
alter table public.grammar_topics enable row level security;
create policy "Grammar topics are public" on public.grammar_topics for select using (true);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
