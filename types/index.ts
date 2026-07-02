export interface Program {
  id: string
  name: string
  slug: string
  short_name: string | null
  description: string | null
  color: string
  is_active: boolean
  created_at: string
}

export interface Event {
  id: string
  program_id: string | null
  date: string
  title: string
  moderator: string | null   // group/team badge label
  resource_persons: string | null
  venue: string
  is_special: boolean
  section: string | null      // 'junior' | 'senior' for Brigade
  description: string | null  // extra details (Junior Brigade activity list)
  created_at: string
}

export interface Subscriber {
  id: string
  name: string
  email: string
  phone: string
  created_at: string
}

export interface NotificationLog {
  id: string
  event_id: string
  subscriber_id: string
  type: 'email' | 'sms'
  status: 'sent' | 'failed'
  sent_at: string
}
