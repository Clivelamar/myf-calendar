import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { sendWelcomeEmail } from '@/lib/resend'
import { sendWelcomeSMS } from '@/lib/africastalking'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, programSlugs } = await request.json()

    if (!name || !email || !phone) {
      return Response.json({ error: 'Name, email, and phone are required.' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Check for duplicate email
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return Response.json(
        { error: 'This email is already subscribed.' },
        { status: 409 }
      )
    }

    // Save subscriber
    const { data: newSubscriber, error: insertError } = await supabase
      .from('subscribers')
      .insert({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim() })
      .select('id')
      .single()

    if (insertError || !newSubscriber) throw insertError

    // Save program preferences — look up IDs by slug
    const slugs: string[] = Array.isArray(programSlugs) && programSlugs.length > 0
      ? programSlugs
      : ['myf', 'brigade', 'church-calendar'] // default: all programs

    const { data: programs } = await supabase
      .from('programs')
      .select('id')
      .in('slug', slugs)

    if (programs && programs.length > 0) {
      const programLinks = programs.map((p: { id: string }) => ({
        subscriber_id: newSubscriber.id,
        program_id: p.id,
      }))
      await supabase.from('subscriber_programs').insert(programLinks)
    }

    // Send welcome email (SMS disabled until AfricasTalking is configured)
    await Promise.allSettled([
      sendWelcomeEmail(email, name),
    ])

    return Response.json({ success: true })
  } catch (err: unknown) {
    console.error('Subscribe error:', err)
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
