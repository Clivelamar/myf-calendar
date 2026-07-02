import { notFound } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { Event, Program } from '@/types'
import Header from '@/components/Header'
import EventCard from '@/components/EventCard'
import { CalendarDays } from 'lucide-react'

const PROGRAM_THEMES: Record<string, string> = {
  myf: 'Walking In The Word: Equipped For Every Good Work.',
  brigade: 'Growing Into Christian Maturity.',
  'church-calendar': 'Walking In The Word: Equipped For Every Good Work. – 2 Timothy 3:16-17',
}

const PROGRAM_LEGENDS: Record<string, { name: string; color: string }[]> = {
  myf: [
    { name: 'Dagadu Group', color: 'bg-blue-100 text-blue-800' },
    { name: 'Wesley Group', color: 'bg-red-100 text-red-700' },
    { name: 'Clegg Group', color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Kitoe Group', color: 'bg-indigo-100 text-indigo-700' },
  ],
  brigade: [
    { name: 'Senior Section', color: 'bg-emerald-100 text-emerald-700' },
    { name: 'Junior Brigade', color: 'bg-amber-100 text-amber-700' },
    { name: 'Chaplaincy', color: 'bg-violet-100 text-violet-700' },
    { name: 'Band', color: 'bg-orange-100 text-orange-700' },
  ],
}

async function getProgram(slug: string): Promise<Program | null> {
  const { data } = await supabase
    .from('programs')
    .select('*')
    .eq('slug', slug)
    .single()
  return data ?? null
}

async function getEvents(programId: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('program_id', programId)
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching events:', error)
    return []
  }
  return data ?? []
}

function groupByMonth(events: Event[]): Record<string, Event[]> {
  return events.reduce((acc, event) => {
    const month = format(parseISO(event.date), 'MMMM yyyy')
    if (!acc[month]) acc[month] = []
    acc[month].push(event)
    return acc
  }, {} as Record<string, Event[]>)
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ProgramPage({ params }: PageProps) {
  const { slug } = await params
  const program = await getProgram(slug)

  if (!program) notFound()

  const events = await getEvents(program.id)
  const grouped = groupByMonth(events)
  const legend = PROGRAM_LEGENDS[slug]
  const theme = PROGRAM_THEMES[slug]

  return (
    <div className="min-h-screen">
      <Header
        programName={program.name}
        programShortName={program.short_name ?? undefined}
        programColor={program.color}
        programSlug={slug}
        theme={theme}
        showBack
      />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
            <CalendarDays size={18} style={{ color: program.color }} />
            <span className="text-sm font-medium text-gray-700">
              {events.length} Events in 2026
            </span>
          </div>
          {theme && (
            <div className="flex items-center gap-2 bg-white rounded-xl border px-4 py-3" style={{ borderColor: `${program.color}40` }}>
              <span className="text-sm font-medium" style={{ color: program.color }}>
                Theme: &ldquo;{theme}&rdquo;
              </span>
            </div>
          )}
        </div>

        {/* Legend */}
        {legend && (
          <div className="flex flex-wrap gap-2 mb-6">
            {legend.map(g => (
              <span key={g.name} className={`text-xs px-2.5 py-1 rounded-full font-medium ${g.color}`}>
                {g.name}
              </span>
            ))}
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <CalendarDays size={48} className="mx-auto mb-4 opacity-30" />
            <p>No events found for this programme.</p>
            <p className="text-sm mt-2">
              Seed events by running:<br />
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                POST /api/events &#123;&quot;program&quot;: &quot;{slug}&quot;&#125;
              </code>
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([month, monthEvents]) => (
              <section key={month}>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: program.color }}>
                  <span
                    className="w-2 h-2 rounded-full inline-block bg-[#C41230]"
                  />
                  {month}
                  <span className="text-gray-400 text-sm font-normal">
                    ({monthEvents.length} event{monthEvents.length > 1 ? 's' : ''})
                  </span>
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {monthEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-16 text-white text-center">
        <div className="h-1 flex">
          <div className="flex-1 bg-[#C41230]" />
          <div className="flex-1 bg-[#D4A017]" />
          <div className="flex-1 bg-[#003580]" />
        </div>
        <div className="bg-[#003580] py-6 px-4">
          <p className="text-blue-200 text-sm">
            Good Shepherd Methodist Church &bull; Kaneshie North Circuit &bull; {program.short_name} 2026
          </p>
          <p className="text-[#D4A017] text-xs mt-1 font-medium">Methodist Church Ghana</p>
        </div>
      </footer>
    </div>
  )
}
