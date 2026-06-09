'use client'

import { useState } from 'react'
import SubscribeModal from './SubscribeModal'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Methodist red top stripe */}
      <div className="h-2 bg-[#C41230]" />
      <header className="bg-[#003580] text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <p className="text-[#D4A017] text-xs font-semibold uppercase tracking-widest">
              Methodist Church Ghana &bull; Kaneshie North Circuit
            </p>
            <h1 className="text-2xl font-bold leading-tight mt-0.5">
              Good Shepherd MYF
            </h1>
            <p className="text-blue-200 text-sm mt-0.5 italic">
              &ldquo;Walking In The Word: Equipped For Every Good Work.&rdquo;
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="bg-[#D4A017] hover:bg-yellow-500 text-[#003580] font-bold px-5 py-2.5 rounded-lg text-sm transition-colors shadow whitespace-nowrap"
          >
            Get Event Alerts
          </button>
        </div>
      </header>
      {/* Methodist gold bottom stripe */}
      <div className="h-1 bg-[#D4A017]" />
      <SubscribeModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
