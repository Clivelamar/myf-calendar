-- ============================================================
-- Good Shepherd Church Calendar – Schema v2 (Multi-Program)
-- Run this in Supabase SQL Editor AFTER the original schema.sql
-- ============================================================

-- 1. Programs table
CREATE TABLE IF NOT EXISTS public.programs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  short_name  TEXT,
  description TEXT,
  color       TEXT NOT NULL DEFAULT '#003580',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Programs are publicly readable"
  ON public.programs FOR SELECT USING (true);

-- 2. Add new columns to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS program_id   UUID REFERENCES public.programs(id);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS section      TEXT;   -- 'junior' | 'senior'
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS description  TEXT;   -- extra activity details

-- 3. Subscriber programs junction (which programs each subscriber follows)
CREATE TABLE IF NOT EXISTS public.subscriber_programs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
  program_id    UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(subscriber_id, program_id)
);

ALTER TABLE public.subscriber_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert subscriber programs"
  ON public.subscriber_programs FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can read subscriber programs"
  ON public.subscriber_programs FOR SELECT USING (true);

-- 4. Seed the 3 programs
INSERT INTO public.programs (name, slug, short_name, description, color) VALUES
  (
    'Methodist Youth Fellowship',
    'myf',
    'MYF',
    'Good Shepherd MYF 2026 Programme of Activities',
    '#003580'
  ),
  (
    'Boys'' & Girls'' Brigade',
    'brigade',
    'Brigade',
    '20th and 18th Accra Boys'' and Girls'' Brigade Company – Senior & Junior Sections',
    '#1a7a4a'
  ),
  (
    'Good Shepherd Society',
    'church-calendar',
    'GS Society',
    'Good Shepherd Methodist Church Society Programme for 2026 – All Organisations',
    '#6b21a8'
  )
ON CONFLICT (slug) DO NOTHING;

-- 5. Link all existing MYF events to the MYF program
UPDATE public.events
SET program_id = (SELECT id FROM public.programs WHERE slug = 'myf')
WHERE program_id IS NULL;

-- 6. Replace unique constraint to allow same event title on same date in different programs
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_date_title_key;
ALTER TABLE public.events
  ADD CONSTRAINT events_date_title_program_key UNIQUE (date, title, program_id);
