import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { sendEventReminderEmail } from '@/lib/resend'
import { sendEventReminderSMS } from '@/lib/africastalking'
import { format, parseISO, differenceInCalendarDays } from 'date-fns'

// Called daily by Vercel Cron — sends reminders for events 7 days and 1 day away
export async function GET(request: NextRequest) {
  // Verify this is called by Vercel Cron or our own system
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Get all upcoming events
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .gte('date', today.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (eventsError) {
    return Response.json({ error: eventsError.message }, { status: 500 })
  }

  // Find events that are exactly 7 or 1 day away
  const targetEvents = (events ?? []).filter(event => {
    const diff = differenceInCalendarDays(parseISO(event.date), today)
    return diff === 7 || diff === 1
  })

  if (targetEvents.length === 0) {
    return Response.json({ message: 'No events to remind today', sent: 0 })
  }

  // Get all subscribers
  const { data: subscribers, error: subsError } = await supabase
    .from('subscribers')
    .select('*')

  if (subsError) {
    return Response.json({ error: subsError.message }, { status: 500 })
  }

  let sent = 0
  const logs = []

  for (const event of targetEvents) {
    const daysUntil = differenceInCalendarDays(parseISO(event.date), today)
    const formattedDate = format(parseISO(event.date), 'EEEE, MMMM d, yyyy')

    for (const subscriber of subscribers ?? []) {
      // Check if we already sent a notification for this event+subscriber+days combination
      const { data: existing } = await supabase
        .from('notification_logs')
        .select('id')
        .eq('event_id', event.id)
        .eq('subscriber_id', subscriber.id)
        .eq('days_before', daysUntil)
        .single()

      if (existing) continue // Already sent, skip

      const [emailResult, smsResult] = await Promise.allSettled([
        sendEventReminderEmail(
          subscriber.email,
          subscriber.name,
          event.title,
          formattedDate,
          event.resource_persons,
          daysUntil
        ),
        sendEventReminderSMS(
          subscriber.phone,
          subscriber.name,
          event.title,
          formattedDate,
          daysUntil
        ),
      ])

      // Log both
      logs.push({
        event_id: event.id,
        subscriber_id: subscriber.id,
        days_before: daysUntil,
        email_status: emailResult.status === 'fulfilled' ? 'sent' : 'failed',
        sms_status: smsResult.status === 'fulfilled' ? 'sent' : 'failed',
      })
      sent++
    }
  }

  // Save logs
  if (logs.length > 0) {
    await supabase.from('notification_logs').insert(logs)
  }

  return Response.json({
    message: `Sent reminders for ${targetEvents.length} event(s) to ${(subscribers ?? []).length} subscriber(s)`,
    sent,
  })
}
