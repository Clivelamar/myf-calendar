import Link from 'next/link'
import { CalendarDays, ArrowRight } from 'lucide-react'
import { Program } from '@/types'

interface Props {
  program: Program
  eventCount: number
}

export default function ProgramCard({ program, eventCount }: Props) {
  return (
    <Link
      href={`/${program.slug}`}
      className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Colored header bar */}
      <div className="h-2" style={{ backgroundColor: program.color }} />

      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span
              className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${program.color}18`, color: program.color }}
            >
              {program.short_name}
            </span>
            <h2 className="text-lg font-bold text-gray-800 mt-2 leading-snug">
              {program.name}
            </h2>
          </div>
          <ArrowRight
            size={20}
            className="shrink-0 mt-1 text-gray-300 group-hover:text-gray-500 transition-colors"
          />
        </div>

        {program.description && (
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            {program.description}
          </p>
        )}

        <div
          className="flex items-center gap-2 text-sm font-medium mt-4 pt-4 border-t border-gray-50"
          style={{ color: program.color }}
        >
          <CalendarDays size={15} />
          <span>{eventCount} event{eventCount !== 1 ? 's' : ''} in 2026</span>
        </div>
      </div>
    </Link>
  )
}
