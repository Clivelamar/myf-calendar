import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServiceClient()
    const { count } = await supabase
      .from('programs')
      .select('*', { count: 'exact', head: true })
    return Response.json({ ok: true, programCount: count })
  } catch (err: unknown) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
