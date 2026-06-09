const smsEnabled =
  !!process.env.AFRICASTALKING_API_KEY && !!process.env.AFRICASTALKING_USERNAME

function getSmsClient() {
  if (!smsEnabled) return null
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const AfricasTalking = require('africastalking')
  const at = AfricasTalking({
    apiKey: process.env.AFRICASTALKING_API_KEY!,
    username: process.env.AFRICASTALKING_USERNAME!,
  })
  return at.SMS
}

export async function sendSMS(to: string, message: string) {
  const sms = getSmsClient()
  if (!sms) {
    console.log('[SMS disabled] Would have sent to', to, ':', message)
    return
  }
  const phone = to.startsWith('+') ? to : `+${to}`
  return sms.send({ to: [phone], message, from: process.env.AFRICASTALKING_SENDER_ID })
}

export async function sendWelcomeSMS(phone: string, name: string) {
  const msg = `Hi ${name}! You're subscribed to Good Shepherd MYF event alerts. You'll get reminders 7 days & 1 day before events. Theme 2026: "Walking In The Word." God bless!`
  return sendSMS(phone, msg)
}

export async function sendEventReminderSMS(
  phone: string,
  name: string,
  eventTitle: string,
  eventDate: string,
  daysUntil: number
) {
  const daysText = daysUntil === 1 ? 'TOMORROW' : `in ${daysUntil} days`
  const msg = `Hi ${name}, reminder: "${eventTitle}" is ${daysText} (${eventDate}) at the Church Hall. Good Shepherd MYF`
  return sendSMS(phone, msg)
}
