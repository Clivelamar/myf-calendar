'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import SubscribeModal from './SubscribeModal'

interface Props {
  programName?: string        // e.g. "Methodist Youth Fellowship"
  programShortName?: string   // e.g. "MYF"
  programColor?: string       // hex color for the bottom stripe
  programSlug?: string        // for the subscribe modal to preselect
  theme?: string              // e.g. "Walking In The Word..."
  showBack?: boolean          // show a back-to-home link
}

export default function Header({
  programName = 'Good Shepherd Methodist Church',
  programShortName,
  programColor = '#003580',
  programSlug,
  theme,
  showBack = false,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Methodist red top stripe */}
      <div className="h-2 bg-[#C41230]" />
      <header className="bg-[#003580] text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              {showBack && (
                <Link
                  href="/"
                  className="text-blue-200 hover:text-white text-xs flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft size={14} />
                  All Programmes
                </Link>
              )}
              <p className="text-[#D4A017] text-xs font-semibold uppercase tracking-widest">
                Methodist Church Ghana &bull; Kaneshie North Circuit
              </p>
            </div>
            <h1 className="text-2xl font-bold leading-tight mt-0.5">
              {programShortName ? (
                <>
                  <span className="text-[#D4A017]">{programShortName}</span>
                  {' '}— Good Shepherd
                </>
              ) : (
                programName
              )}
            </h1>
            {theme && (
              <p className="text-blue-200 text-sm mt-0.5 italic">
                &ldquo;{theme}&rdquo;
              </p>
            )}
          </div>
          <button
            onClick={() => setOpen(true)}
            className="bg-[#D4A017] hover:bg-yellow-500 text-[#003580] font-bold px-5 py-2.5 rounded-lg text-sm transition-colors shadow whitespace-nowrap"
          >
            Get Event Alerts
          </button>
        </div>
      </header>
      {/* Colored bottom stripe (program color or gold) */}
      <div className="h-1" style={{ backgroundColor: programColor === '#003580' ? '#D4A017' : programColor }} />
      <SubscribeModal open={open} onClose={() => setOpen(false)} defaultSlug={programSlug} />
    </>
  )
}
