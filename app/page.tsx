import { supabase } from '@/lib/supabase'
import { Program } from '@/types'
import ProgramCard from '@/components/ProgramCard'
import HomeHeader from '@/components/HomeHeader'
import HeroSlider from '@/components/HeroSlider'

async function getPrograms(): Promise<{ program: Program; eventCount: number }[]> {
  const { data: programs } = await supabase
    .from('programs')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (!programs || programs.length === 0) return []

  const results = await Promise.all(
    programs.map(async (program: Program) => {
      const { count } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('program_id', program.id)
      return { program, eventCount: count ?? 0 }
    })
  )
  return results
}

export default async function Home() {
  const programs = await getPrograms()

  return (
    <div className="min-h-screen">
      <HomeHeader />
      <HeroSlider />

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#003580] mb-1">
            2026 Programme Calendars
          </h2>
          <p className="text-gray-500 text-sm">
            Select a programme to view its full 2026 calendar and subscribe for reminders.
          </p>
        </div>

        {programs.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>No programmes found. Run the Supabase schema-v2.sql migration first.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {programs.map(({ program, eventCount }) => (
              <ProgramCard key={program.id} program={program} eventCount={eventCount} />
            ))}
          </div>
        )}

        <div className="mt-12 bg-[#D4A017]/10 border border-[#D4A017]/30 rounded-xl p-5 text-center">
          <p className="text-[#003580] font-semibold text-sm">
            2026 Theme: &ldquo;Walking In The Word: Equipped For Every Good Work.&rdquo;
          </p>
          <p className="text-gray-500 text-xs mt-1">2 Timothy 3:16-17</p>
        </div>
      </main>

      <footer className="mt-16 text-white text-center">
        <div className="h-1 flex">
          <div className="flex-1 bg-[#C41230]" />
          <div className="flex-1 bg-[#D4A017]" />
          <div className="flex-1 bg-[#003580]" />
        </div>
        <div className="bg-[#003580] py-6 px-4">
          <p className="text-blue-200 text-sm">
            Good Shepherd Methodist Church &bull; Kaneshie North Circuit
          </p>
          <p className="text-[#D4A017] text-xs mt-1 font-medium">Methodist Church Ghana</p>
        </div>
      </footer>
    </div>
  )
}
