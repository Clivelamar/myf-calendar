-- ============================================================
-- Good Shepherd MYF Calendar – Supabase Schema
-- Run this once in Supabase SQL Editor (supabase.com → SQL Editor)
-- ============================================================

-- 1. Events table
create table if not exists public.events (
  id              uuid primary key default gen_random_uuid(),
  date            date not null,
  title           text not null,
  moderator       text,
  resource_persons text,
  venue           text not null default 'Church hall',
  is_special      boolean not null default false,
  created_at      timestamptz not null default now(),
  unique (date, title)
);

-- 2. Subscribers table
create table if not exists public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null unique,
  phone      text not null,
  created_at timestamptz not null default now()
);

-- 3. Notification logs (prevents duplicate sends)
create table if not exists public.notification_logs (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references public.events(id) on delete cascade,
  subscriber_id  uuid not null references public.subscribers(id) on delete cascade,
  days_before    int not null,  -- 7 or 1
  email_status   text not null default 'sent',
  sms_status     text not null default 'sent',
  sent_at        timestamptz not null default now(),
  unique (event_id, subscriber_id, days_before)
);

-- ─── Row Level Security ────────────────────────────────────────
-- Allow anyone to read events (public calendar)
alter table public.events enable row level security;
create policy "Events are publicly readable"
  on public.events for select using (true);

-- Subscribers: only insert from API (service role bypasses RLS)
alter table public.subscribers enable row level security;
create policy "Anyone can subscribe"
  on public.subscribers for insert with check (true);

-- Notification logs: service role only
alter table public.notification_logs enable row level security;
