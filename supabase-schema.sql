-- Gymbro Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  age integer not null,
  height real not null, -- cm
  weight real not null, -- kg
  injury_notes text,
  long_term_goal text not null,
  xp integer not null default 0,
  soft_streaks integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create chapters table
create type chapter_focus as enum ('drainage', 'strength', 'maintenance');
create type chapter_status as enum ('active', 'paused', 'completed');

create table chapters (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  chapter_name text not null,
  duration integer not null, -- days
  focus chapter_focus not null,
  status chapter_status not null default 'paused',
  start_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create daily_check_ins table
create type alcohol_intake as enum ('none', 'low', 'high');

create table daily_check_ins (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null,
  weight real not null, -- kg
  bloating_level integer not null check (bloating_level >= 1 and bloating_level <= 5),
  energy integer not null check (energy >= 1 and energy <= 5),
  alcohol_intake alcohol_intake not null default 'none',
  movement_done boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- Create indexes for performance
create index idx_chapters_user_id on chapters(user_id);
create index idx_chapters_status on chapters(status);
create index idx_check_ins_user_id on daily_check_ins(user_id);
create index idx_check_ins_date on daily_check_ins(date);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table chapters enable row level security;
alter table daily_check_ins enable row level security;

-- RLS Policies for profiles
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- RLS Policies for chapters
create policy "Users can view own chapters"
  on chapters for select
  using (auth.uid() = user_id);

create policy "Users can insert own chapters"
  on chapters for insert
  with check (auth.uid() = user_id);

create policy "Users can update own chapters"
  on chapters for update
  using (auth.uid() = user_id);

create policy "Users can delete own chapters"
  on chapters for delete
  using (auth.uid() = user_id);

-- RLS Policies for daily_check_ins
create policy "Users can view own check-ins"
  on daily_check_ins for select
  using (auth.uid() = user_id);

create policy "Users can insert own check-ins"
  on daily_check_ins for insert
  with check (auth.uid() = user_id);

create policy "Users can update own check-ins"
  on daily_check_ins for update
  using (auth.uid() = user_id);

create policy "Users can delete own check-ins"
  on daily_check_ins for delete
  using (auth.uid() = user_id);
