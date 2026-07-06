'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import SubscribeModal from './SubscribeModal'

// To add real photos later:
// 1. Save photos to /public/images/ as hero-1.jpg, hero-2.jpg, hero-3.jpg, hero-4.jpg
// 2. Uncomment the image: line for each slide below
const SLIDES = [
  {
    // image: '/images/hero-1.jpg',
    gradient: 'linear-gradient(145deg, #001233 0%, #003580 55%, #0047b3 100%)',
    overlay: 'rgba(0,18,51,0.75)',
    badge: '2026 Theme',
    title: 'Walking In The Word',
    subtitle: 'Equipped For Every Good Work',
    note: '2 Timothy 3:16–17',
    cta: 'View MYF Calendar',
    href: '/myf',
  },
  {
    // image: '/images/hero-2.jpg',
    gradient: 'linear-gradient(145deg, #0a2e18 0%, #1a7a4a 55%, #22a865 100%)',
    overlay: 'rgba(10,46,24,0.75)',
    badge: "Boys' & Girls' Brigade",
    title: "Christian Leadership in Action",
    subtitle: '20th & 18th Accra Company',
    note: 'Senior Section · Junior Brigade · 73 Events in 2026',
    cta: 'View Brigade Calendar',
    href: '/brigade',
  },
  {
    // image: '/images/hero-3.jpg',
    gradient: 'linear-gradient(145deg, #1a0030 0%, #6b21a8 55%, #9333ea 100%)',
    overlay: 'rgba(26,0,48,0.75)',
    badge: 'Good Shepherd Society',
    title: 'All 2026 Programmes',
    subtitle: '188 Events Across All Organisations',
    note: "Women's · Men's Fellowship · MYF · Brigade · Singing Band & More",
    cta: 'View Church Calendar',
    href: '/church-calendar',
  },
  {
    // image: '/images/hero-4.jpg',
    gradient: 'linear-gradient(145deg, #4a0022 0%, #be185d 55%, #db2777 100%)',
    overlay: 'rgba(74,0,34,0.75)',
    badge: "Methodist Girls' Fellowship",
    title: 'Growing Women in Faith & Service',
    subtitle: '53 Events in 2026',
    note: 'Visitations · Leadership Summit · Mentorship · Community Service',
    cta: 'View MGF Calendar',
    href: '/mgf',
  },
  {
    // image: '/images/hero-5.jpg',
    gradient: 'linear-gradient(145deg, #3d0010 0%, #8B0000 55%, #C41230 100%)',
    overlay: 'rgba(61,0,16,0.75)',
    badge: 'Stay Connected',
    title: 'Never Miss an Event',
    subtitle: 'Get Reminders 7 Days & 1 Day Before Each Event',
    note: 'Free · Email & SMS Alerts · Unsubscribe Anytime',
    cta: 'Subscribe for Free',
    href: '#subscribe',
  },
] as const

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const advance = useCallback(() => {
    setCurrent(c => (c + 1) % SLIDES.length)
  }, [])

  useEffect(() => {
    if (paused) return
    timerRef.current = setInterval(advance, 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [paused, advance])

  const slide = SLIDES[current]

  return (
    <>
      <div
        className="relative w-full overflow-hidden"
        style={{ height: 'clamp(420px, 56vw, 560px)' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Background slides */}
        {SLIDES.map((s, i) => {
          const hasImage = 'image' in s && s.image
          return (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-700 ease-in-out"
              style={{ opacity: i === current ? 1 : 0 }}
            >
              {hasImage ? (
                <>
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${s.image})` }}
                  />
                  <div className="absolute inset-0" style={{ background: s.overlay }} />
                </>
              ) : (
                <div className="absolute inset-0" style={{ background: s.gradient }} />
              )}

              {/* Subtle cross watermark */}
              <div className="absolute inset-0 flex items-center justify-end pr-8 sm:pr-16 opacity-[0.055] pointer-events-none select-none">
                <svg width="320" height="320" viewBox="0 0 100 100" fill="white">
                  <rect x="42" y="5" width="16" height="90" rx="4" />
                  <rect x="10" y="28" width="80" height="16" rx="4" />
                </svg>
              </div>

              {/* Bottom fade */}
              <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          )
        })}

        {/* Slide content */}
        <div className="relative z-10 h-full flex flex-col justify-center max-w-5xl mx-auto px-6 sm:px-12">
          <span
            className="inline-block mb-4 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full w-fit"
            style={{ background: '#D4A017', color: '#003580' }}
          >
            {slide.badge}
          </span>

          <h2 className="text-3xl sm:text-[2.75rem] font-extrabold text-white leading-tight mb-3 drop-shadow-lg">
            {slide.title}
          </h2>

          <p className="text-base sm:text-xl text-white/90 font-medium mb-1.5">
            {slide.subtitle}
          </p>

          <p className="text-xs sm:text-sm text-white/60 italic mb-8">
            {slide.note}
          </p>

          {slide.href === '#subscribe' ? (
            <button
              onClick={() => setShowModal(true)}
              className="w-fit bg-[#D4A017] hover:bg-yellow-400 text-[#003580] font-bold px-7 py-3 rounded-xl text-sm transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              {slide.cta}
            </button>
          ) : (
            <Link
              href={slide.href}
              className="w-fit bg-[#D4A017] hover:bg-yellow-400 text-[#003580] font-bold px-7 py-3 rounded-xl text-sm transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              {slide.cta}
            </Link>
          )}
        </div>

        {/* Prev arrow */}
        <button
          onClick={() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length)}
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 bg-white/15 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2.5 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Next arrow */}
        <button
          onClick={() => setCurrent(c => (c + 1) % SLIDES.length)}
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 bg-white/15 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2.5 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>

        {/* Dot navigation */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? '26px' : '8px',
                height: '8px',
                background: i === current ? '#D4A017' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white/10 z-20">
          <div
            className="h-full bg-[#D4A017]/70 transition-all duration-500"
            style={{ width: `${((current + 1) / SLIDES.length) * 100}%` }}
          />
        </div>
      </div>

      <SubscribeModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}
