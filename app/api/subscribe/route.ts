import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { sendWelcomeEmail } from '@/lib/resend'
import { sendWelcomeSMS } from '@/lib/africastalking'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone } = await request.json()

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
    const { error: insertError } = await supabase
      .from('subscribers')
      .insert({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim() })

    if (insertError) throw insertError

    // Send welcome email and SMS in parallel (don't fail the request if these fail)
    await Promise.allSettled([
      sendWelcomeEmail(email, name),
      sendWelcomeSMS(phone, name),
    ])

    return Response.json({ success: true })
  } catch (err: unknown) {
    console.error('Subscribe error:', err)
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
