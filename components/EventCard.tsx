import { format, parseISO, isPast, isToday } from 'date-fns'
import { Calendar, MapPin, Users, Star, BookOpen } from 'lucide-react'
import { Event } from '@/types'

interface Props {
  event: Event
}

const BADGE_COLORS: Record<string, string> = {
  // MYF groups
  Dagadu: 'bg-blue-100 text-blue-800',
  Wesley: 'bg-red-100 text-red-700',
  Clegg: 'bg-yellow-100 text-yellow-800',
  Kitoe: 'bg-indigo-100 text-indigo-700',
  // Brigade teams
  Chaplaincy: 'bg-violet-100 text-violet-700',
  'Senior Section': 'bg-emerald-100 text-emerald-700',
  'Junior Brigade': 'bg-amber-100 text-amber-700',
  Band: 'bg-orange-100 text-orange-700',
  Finance: 'bg-teal-100 text-teal-700',
  Secretariat: 'bg-sky-100 text-sky-700',
  // Church calendar organisations
  "Women's Fellowship": 'bg-pink-100 text-pink-700',
  "Men's Fellowship": 'bg-slate-100 text-slate-700',
  MYF: 'bg-blue-100 text-blue-800',
  Brigade: 'bg-emerald-100 text-emerald-700',
  'Christ Little Band': 'bg-red-100 text-red-700',
  'Singing Band': 'bg-purple-100 text-purple-700',
  'Church Choir': 'bg-indigo-100 text-indigo-700',
  'Circuit Choir': 'bg-indigo-100 text-indigo-700',
  COEYD: 'bg-cyan-100 text-cyan-700',
  YDM: 'bg-lime-100 text-lime-700',
  Guild: 'bg-fuchsia-100 text-fuchsia-700',
  MGF: 'bg-rose-100 text-rose-700',
  'Lay Movement': 'bg-stone-100 text-stone-700',
  COM: 'bg-zinc-100 text-zinc-700',
  Circuit: 'bg-gray-100 text-gray-600',
  SUWMA: 'bg-yellow-100 text-yellow-700',
}

const SECTION_LABEL: Record<string, string> = {
  senior: 'Senior',
  junior: 'Junior',
}

export default function EventCard({ event }: Props) {
  const date = parseISO(event.date)
  const past = isPast(date) && !isToday(date)
  const today = isToday(date)

  const badgeColor = BADGE_COLORS[event.moderator ?? ''] ?? 'bg-gray-100 text-gray-600'

  return (
    <div
      className={`bg-white rounded-xl border p-4 transition-shadow hover:shadow-md ${
        past ? 'opacity-50' : ''
      } ${today ? 'border-[#003580] ring-2 ring-[#003580]/20' : 'border-gray-100'} ${
        event.is_special ? 'border-l-4 border-l-[#D4A017]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            {today && (
              <span className="bg-[#C41230] text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                Today
              </span>
            )}
            {event.is_special && (
              <span className="bg-[#D4A017] text-[#003580] text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <Star size={10} /> Special
              </span>
            )}
            {event.section && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                event.section === 'junior' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {SECTION_LABEL[event.section]}
              </span>
            )}
            {event.moderator && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>
                {event.moderator}
              </span>
            )}
          </div>

          <h3 className="font-semibold text-gray-800 text-sm leading-snug">{event.title}</h3>

          {event.description && (
            <p className="mt-1 text-xs text-gray-400 leading-relaxed line-clamp-2 flex items-start gap-1">
              <BookOpen size={11} className="mt-0.5 shrink-0" />
              {event.description}
            </p>
          )}

          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <Calendar size={12} />
              <span>{format(date, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <MapPin size={12} />
              <span>{event.venue}</span>
            </div>
            {event.resource_persons && (
              <div className="flex items-start gap-1.5 text-gray-500 text-xs">
                <Users size={12} className="mt-0.5 shrink-0" />
                <span className="line-clamp-2">{event.resource_persons}</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-center shrink-0 w-12">
          <div className="text-2xl font-bold text-[#003580] leading-none">
            {format(date, 'd')}
          </div>
          <div className="text-gray-400 text-xs uppercase tracking-wide">
            {format(date, 'MMM')}
          </div>
        </div>
      </div>
    </div>
  )
}
