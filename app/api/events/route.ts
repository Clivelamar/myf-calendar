import { NextRequest } from 'next/server'
import { supabase, createServiceClient } from '@/lib/supabase'
import { EVENTS_SEED } from '@/lib/events-data'
import { BRIGADE_SENIOR_SEED } from '@/lib/brigade-senior-data'
import { BRIGADE_JUNIOR_SEED } from '@/lib/brigade-junior-data'
import { CHURCH_CALENDAR_SEED } from '@/lib/church-calendar-data'

const SEED_MAP: Record<string, typeof EVENTS_SEED> = {
  myf: EVENTS_SEED,
  'brigade-senior': BRIGADE_SENIOR_SEED,
  'brigade-junior': BRIGADE_JUNIOR_SEED,
  'church-calendar': CHURCH_CALENDAR_SEED,
}

// GET /api/events?program=myf  — returns events for a program (or all if no param)
// Uses the public anon client since events are publicly readable via RLS
export async function GET(request: NextRequest) {
  try {
    const programSlug = request.nextUrl.searchParams.get('program')

    let query = supabase.from('events').select('*').order('date', { ascending: true })

    if (programSlug) {
      const { data: program } = await supabase
        .from('programs')
        .select('id')
        .eq('slug', programSlug)
        .single()

      if (!program) return Response.json({ error: 'Program not found' }, { status: 404 })
      query = query.eq('program_id', program.id)
    }

    const { data, error } = await query
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json(data)
  } catch (err: unknown) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

// POST /api/events  body: { program: 'myf' | 'brigade-senior' | 'brigade-junior' | 'church-calendar' }
// Seeds the database with events for a specific program. Protected by CRON_SECRET.
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const program: string = body.program ?? 'myf'
  const seedData = SEED_MAP[program]

  if (!seedData) {
    return Response.json(
      { error: `Unknown program. Valid: ${Object.keys(SEED_MAP).join(', ')}` },
      { status: 400 }
    )
  }

  const supabase = createServiceClient()

  // Look up the program_id for Brigade: both senior and junior map to the 'brigade' program slug
  const programSlug = program === 'brigade-senior' || program === 'brigade-junior' ? 'brigade' : program
  const { data: programRow } = await supabase
    .from('programs')
    .select('id')
    .eq('slug', programSlug)
    .single()

  if (!programRow) {
    return Response.json(
      { error: `Program '${programSlug}' not found in database. Run schema-v2.sql first.` },
      { status: 404 }
    )
  }

  const eventsWithProgramId = seedData.map(e => ({ ...e, program_id: programRow.id }))

  const { error } = await supabase
    .from('events')
    .upsert(eventsWithProgramId, { onConflict: 'date,title,program_id' })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true, program, count: seedData.length })
}
