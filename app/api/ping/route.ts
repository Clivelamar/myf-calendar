import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test public client (anon key) — used by pages and GET /api/events
    const { count, error } = await supabase
      .from('programs')
      .select('*', { count: 'exact', head: true })
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    const hasResendKey = !!process.env.RESEND_API_KEY
    return Response.json({
      ok: !error,
      programCount: count,
      supabaseError: error?.message ?? null,
      hasServiceKey,
      hasResendKey,
    })
  } catch (err: unknown) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
