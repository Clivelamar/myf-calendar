import { format, parseISO } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { Event } from '@/types'
import Header from '@/components/Header'
import EventCard from '@/components/EventCard'
import { CalendarDays } from 'lucide-react'

async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
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

export default async function Home() {
  const events = await getEvents()
  const grouped = groupByMonth(events)

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats bar */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
            <CalendarDays size={18} className="text-[#003580]" />
            <span className="text-sm font-medium text-gray-700">
              {events.length} Events in 2026
            </span>
          </div>
          <div className="flex items-center gap-2 bg-[#D4A017]/10 rounded-xl border border-[#D4A017] px-4 py-3">
            <span className="text-sm font-medium text-[#003580]">
              Theme: &ldquo;Walking In The Word: Equipped For Every Good Work.&rdquo;
            </span>
          </div>
        </div>

        {/* Group legend */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { name: 'Dagadu', color: 'bg-blue-100 text-blue-800' },
            { name: 'Wesley', color: 'bg-red-100 text-red-700' },
            { name: 'Clegg', color: 'bg-yellow-100 text-yellow-800' },
            { name: 'Kitoe', color: 'bg-indigo-100 text-indigo-700' },
          ].map(g => (
            <span key={g.name} className={`text-xs px-2.5 py-1 rounded-full font-medium ${g.color}`}>
              {g.name} Group
            </span>
          ))}
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <CalendarDays size={48} className="mx-auto mb-4 opacity-30" />
            <p>No events found. Please check your Supabase connection.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([month, monthEvents]) => (
              <section key={month}>
                <h2 className="text-lg font-bold text-[#003580] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C41230] inline-block" />
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
            Good Shepherd Methodist Church &bull; Kaneshie North Circuit &bull; MYF 2026
          </p>
          <p className="text-[#D4A017] text-xs mt-1 font-medium">
            Methodist Church Ghana
          </p>
        </div>
      </footer>
    </div>
  )
}
