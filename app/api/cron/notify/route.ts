import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { sendEventReminderEmail } from '@/lib/resend'
import { sendEventReminderSMS } from '@/lib/africastalking'
import { format, parseISO, differenceInCalendarDays } from 'date-fns'

// Called daily by Vercel Cron at 6 AM — sends reminders 7 days and 1 day before each event
// Only notifies subscribers who follow that event's program
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get upcoming events (with program info)
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .gte('date', today.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (eventsError) return Response.json({ error: eventsError.message }, { status: 500 })

  // Keep only events that are exactly 7 or 1 day away
  const targetEvents = (events ?? []).filter(event => {
    const diff = differenceInCalendarDays(parseISO(event.date), today)
    return diff === 7 || diff === 1
  })

  if (targetEvents.length === 0) {
    return Response.json({ message: 'No events to remind today', sent: 0 })
  }

  // Get all subscriber program preferences
  const { data: subscriberPrograms, error: spError } = await supabase
    .from('subscriber_programs')
    .select('subscriber_id, program_id')

  if (spError) return Response.json({ error: spError.message }, { status: 500 })

  // Get all subscribers
  const { data: subscribers, error: subsError } = await supabase
    .from('subscribers')
    .select('*')

  if (subsError) return Response.json({ error: subsError.message }, { status: 500 })

  // Build a quick lookup: program_id → set of subscriber_ids
  const programSubscriberMap = new Map<string, Set<string>>()
  for (const sp of subscriberPrograms ?? []) {
    if (!programSubscriberMap.has(sp.program_id)) {
      programSubscriberMap.set(sp.program_id, new Set())
    }
    programSubscriberMap.get(sp.program_id)!.add(sp.subscriber_id)
  }

  const subscriberMap = new Map((subscribers ?? []).map(s => [s.id, s]))

  let sent = 0
  const logs = []

  for (const event of targetEvents) {
    const daysUntil = differenceInCalendarDays(parseISO(event.date), today)
    const formattedDate = format(parseISO(event.date), 'EEEE, MMMM d, yyyy')

    // Find subscribers who follow this event's program
    const eligibleSubscriberIds = event.program_id
      ? (programSubscriberMap.get(event.program_id) ?? new Set())
      : new Set(subscriberMap.keys()) // if no program_id, notify everyone

    for (const subscriberId of eligibleSubscriberIds) {
      const subscriber = subscriberMap.get(subscriberId)
      if (!subscriber) continue

      // Skip if already sent for this event+subscriber+days combination
      const { data: existing } = await supabase
        .from('notification_logs')
        .select('id')
        .eq('event_id', event.id)
        .eq('subscriber_id', subscriber.id)
        .eq('days_before', daysUntil)
        .single()

      if (existing) continue

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

  if (logs.length > 0) {
    await supabase.from('notification_logs').insert(logs)
  }

  return Response.json({
    message: `Sent reminders for ${targetEvents.length} event(s) to ${sent} subscriber(s)`,
    sent,
  })
}
