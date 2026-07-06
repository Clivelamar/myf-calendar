import { supabase } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'
import { CalendarDays, Star } from 'lucide-react'

interface TodayEvent {
  id: string
  title: string
  venue: string
  is_special: boolean
  program_id: string | null
  date?: string
}

interface ProgramInfo {
  id: string
  name: string
  slug: string
  color: string
  short_name: string | null
}

export default async function TodayHighlights() {
  const todayStr = new Date().toISOString().split('T')[0]

  const [eventsRes, programsRes] = await Promise.all([
    supabase
      .from('events')
      .select('id, title, venue, is_special, program_id')
      .eq('date', todayStr)
      .order('title'),
    supabase
      .from('programs')
      .select('id, name, slug, color, short_name'),
  ])

  const programMap = new Map<string, ProgramInfo>(
    (programsRes.data ?? []).map((p: ProgramInfo) => [p.id, p])
  )

  let events: TodayEvent[] = eventsRes.data ?? []
  let isUpcoming = false

  // No events today — show next upcoming instead
  if (events.length === 0) {
    isUpcoming = true
    const { data } = await supabase
      .from('events')
      .select('id, title, venue, is_special, program_id, date')
      .gt('date', todayStr)
      .order('date')
      .limit(5)
    events = data ?? []
  }

  if (events.length === 0) return null

  const dayName  = format(new Date(), 'EEEE')
  const dayNum   = format(new Date(), 'd')
  const monthStr = format(new Date(), 'MMM')
  const yearStr  = format(new Date(), 'yyyy')

  return (
    <section className="bg-[#003580] border-t-2 border-[#D4A017]/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex gap-4 sm:gap-6 items-start">

          {/* Date widget */}
          <div className="shrink-0 bg-white/10 rounded-2xl text-center px-4 py-3 min-w-[68px] border border-white/10">
            <p className="text-[#D4A017] text-[9px] font-extrabold uppercase tracking-widest leading-none">
              {dayName.slice(0, 3)}
            </p>
            <p className="text-white text-[2.6rem] font-black leading-none mt-1.5">{dayNum}</p>
            <p className="text-white/50 text-[10px] font-medium mt-1 leading-none">{monthStr}</p>
            <p className="text-white/30 text-[9px] mt-0.5 leading-none">{yearStr}</p>
          </div>

          {/* Events */}
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays size={14} className="text-[#D4A017] shrink-0" />
              <span className="text-[#D4A017] text-[11px] font-extrabold uppercase tracking-widest">
                {isUpcoming ? 'Coming Up Next' : "Today's Events"}
              </span>
              {!isUpcoming && (
                <>
                  <span className="text-white/30 text-xs">·</span>
                  <span className="text-white/40 text-[11px]">
                    {events.length} event{events.length !== 1 ? 's' : ''}
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {events.map(event => {
                const program = event.program_id ? programMap.get(event.program_id) : null
                return (
                  <Link
                    key={event.id}
                    href={program ? `/${program.slug}` : '/'}
                    className="group flex items-start gap-2 bg-white/[0.09] hover:bg-white/[0.17] border border-white/10 rounded-xl px-3 py-2.5 transition-colors"
                  >
                    {program && (
                      <span
                        className="mt-[3px] w-2 h-2 rounded-full shrink-0"
                        style={{ background: program.color }}
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-white text-xs font-semibold leading-snug group-hover:text-[#D4A017] transition-colors flex items-center gap-1">
                        {event.title}
                        {event.is_special && (
                          <Star size={10} className="text-[#D4A017] fill-[#D4A017] shrink-0" />
                        )}
                      </p>
                      {isUpcoming && event.date && (
                        <p className="text-[#D4A017]/70 text-[10px] font-semibold mt-0.5">
                          {format(parseISO(event.date), 'EEE, d MMM')}
                        </p>
                      )}
                      <p className="text-white/35 text-[10px] mt-0.5">{event.venue}</p>
                      {program && (
                        <p className="text-white/25 text-[10px]">
                          {program.short_name ?? program.name}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
