import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { EVENTS_SEED } from '@/lib/events-data'

// GET /api/events — returns all events
export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

// POST /api/events/seed — seeds the database with all events (call once)
// Protected by a secret token
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Upsert all events (safe to call multiple times)
  const { error } = await supabase
    .from('events')
    .upsert(EVENTS_SEED, { onConflict: 'date,title' })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true, count: EVENTS_SEED.length })
}
