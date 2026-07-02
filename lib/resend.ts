import { Resend } from 'resend'


export const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendWelcomeEmail(to: string, name: string) {
  return resend.emails.send({
    from: 'Good Shepherd MYF <onboarding@resend.dev>',
    to,
    subject: 'You\'re subscribed to Good Shepherd MYF Events!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="height:4px;display:flex"><div style="flex:1;background:#C41230"></div><div style="flex:1;background:#D4A017"></div><div style="flex:1;background:#003580"></div></div>
        <div style="background: #003580; padding: 20px; text-align: center;">
          <h1 style="color: #D4A017; margin: 0; font-size: 22px;">Good Shepherd Methodist Church</h1>
          <p style="color: #fff; margin: 4px 0 0;">Methodist Youth Fellowship</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <h2 style="color: #003580;">Welcome, ${name}!</h2>
          <p style="color: #444; line-height: 1.6;">
            You are now subscribed to <strong>Good Shepherd MYF</strong> event notifications.
            You will receive reminders 7 days and 1 day before each event.
          </p>
          <p style="color: #444; line-height: 1.6;">
            Our 2026 theme is:<br/>
            <em style="color: #003580; font-size: 16px;">"Walking In The Word: Equipped For Every Good Work."</em>
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}"
               style="background: #003580; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              View All Events
            </a>
          </div>
          <p style="color: #888; font-size: 12px; text-align: center; margin-top: 20px;">
            Kaneshie North Circuit &bull; Good Shepherd Methodist Church
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendEventReminderEmail(
  to: string,
  name: string,
  eventTitle: string,
  eventDate: string,
  resourcePersons: string | null,
  daysUntil: number
) {
  const daysText = daysUntil === 1 ? 'TOMORROW' : `in ${daysUntil} days`

  return resend.emails.send({
    from: 'Good Shepherd MYF <onboarding@resend.dev>',
    to,
    subject: `Reminder: ${eventTitle} – ${daysText}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="height:4px;display:flex"><div style="flex:1;background:#C41230"></div><div style="flex:1;background:#D4A017"></div><div style="flex:1;background:#003580"></div></div>
        <div style="background: #003580; padding: 20px; text-align: center;">
          <h1 style="color: #D4A017; margin: 0; font-size: 22px;">Good Shepherd MYF</h1>
          <p style="color: #fff; margin: 4px 0 0;">Event Reminder</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <h2 style="color: #003580;">Hi ${name},</h2>
          <div style="background: #fff; border-left: 4px solid #D4A017; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #888; font-size: 13px; margin: 0 0 4px;">UPCOMING EVENT</p>
            <h3 style="color: #003580; margin: 0 0 8px; font-size: 20px;">${eventTitle}</h3>
            <p style="color: #444; margin: 0;"><strong>Date:</strong> ${eventDate}</p>
            <p style="color: #444; margin: 4px 0 0;"><strong>Venue:</strong> Church Hall</p>
            ${resourcePersons ? `<p style="color: #444; margin: 4px 0 0;"><strong>Resource Person(s):</strong> ${resourcePersons}</p>` : ''}
          </div>
          <p style="color: #444;">
            This event is <strong style="color: #e05c1a;">${daysText}</strong>. We hope to see you there!
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}"
               style="background: #003580; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              View All Events
            </a>
          </div>
          <p style="color: #888; font-size: 12px; text-align: center; margin-top: 20px;">
            Kaneshie North Circuit &bull; Good Shepherd Methodist Church
          </p>
        </div>
      </div>
    `,
  })
}
