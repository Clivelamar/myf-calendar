'use client'

import { useState } from 'react'
import { X, Bell, CheckCircle } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  defaultSlug?: string  // pre-select a specific program if opened from its page
}

const ALL_PROGRAMS = [
  { slug: 'myf', label: 'Methodist Youth Fellowship (MYF)', color: '#003580' },
  { slug: 'brigade', label: "Boys' & Girls' Brigade", color: '#1a7a4a' },
  { slug: 'church-calendar', label: 'Good Shepherd Society (All Events)', color: '#6b21a8' },
]

export default function SubscribeModal({ open, onClose, defaultSlug }: Props) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(
    defaultSlug ? [defaultSlug] : ['myf', 'brigade', 'church-calendar']
  )
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  function toggleProgram(slug: string) {
    setSelectedPrograms(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedPrograms.length === 0) {
      setError('Please select at least one programme.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, programSlugs: selectedPrograms }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setSuccess(false)
    setError('')
    setForm({ name: '', email: '', phone: '' })
    setSelectedPrograms(defaultSlug ? [defaultSlug] : ['myf', 'brigade', 'church-calendar'])
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Methodist color bar */}
        <div className="h-1.5 flex">
          <div className="flex-1 bg-[#C41230]" />
          <div className="flex-1 bg-[#003580]" />
          <div className="flex-1 bg-[#D4A017]" />
        </div>

        <div className="p-6">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>

          {success ? (
            <div className="text-center py-6">
              <CheckCircle size={56} className="mx-auto text-[#003580] mb-4" />
              <h2 className="text-xl font-bold text-[#003580]">You&apos;re subscribed!</h2>
              <p className="text-gray-500 mt-2 text-sm">
                You&apos;ll receive email reminders before each event.
                Check your inbox for a welcome message.
              </p>
              <button
                onClick={handleClose}
                className="mt-5 bg-[#003580] text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-900 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Bell size={22} className="text-[#003580]" />
                <h2 className="text-lg font-bold text-gray-800">Get Event Alerts</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Programme selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Which programmes? <span className="text-gray-400 font-normal">(select all that apply)</span>
                  </label>
                  <div className="space-y-2">
                    {ALL_PROGRAMS.map(p => (
                      <label
                        key={p.slug}
                        className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPrograms.includes(p.slug)}
                          onChange={() => toggleProgram(p.slug)}
                          className="rounded border-gray-300 w-4 h-4 cursor-pointer"
                          style={{ accentColor: p.color }}
                        />
                        <span className="text-sm text-gray-700">{p.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Kwame Mensah"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003580]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003580]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Ghana)</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+233 XX XXX XXXX"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003580]"
                  />
                  <p className="text-gray-400 text-xs mt-1">Include country code e.g. +233201234567</p>
                </div>

                {error && (
                  <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#003580] hover:bg-blue-900 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
                >
                  {loading ? 'Subscribing...' : 'Subscribe for Free'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
