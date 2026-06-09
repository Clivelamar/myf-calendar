export interface Event {
  id: string
  date: string
  title: string
  moderator: string | null
  resource_persons: string | null
  venue: string
  is_special: boolean // Saturday events like Aerobics, Cooking etc.
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
