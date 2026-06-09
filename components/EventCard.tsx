import { format, parseISO, isPast, isToday } from 'date-fns'
import { Calendar, MapPin, Users, Star } from 'lucide-react'
import { Event } from '@/types'

interface Props {
  event: Event
}

const MODERATOR_COLORS: Record<string, string> = {
  Dagadu: 'bg-blue-100 text-blue-800',
  Wesley: 'bg-red-100 text-red-700',
  Clegg: 'bg-yellow-100 text-yellow-800',
  Kitoe: 'bg-indigo-100 text-indigo-700',
}

export default function EventCard({ event }: Props) {
  const date = parseISO(event.date)
  const past = isPast(date) && !isToday(date)
  const today = isToday(date)

  const colorClass =
    MODERATOR_COLORS[event.moderator ?? ''] ?? 'bg-gray-100 text-gray-600'

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
          <div className="flex items-center gap-2 flex-wrap mb-1">
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
            {event.moderator && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
                {event.moderator}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-800 text-sm leading-snug">{event.title}</h3>

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
