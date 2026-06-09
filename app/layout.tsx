import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Good Shepherd MYF – 2026 Events Calendar',
  description:
    'Methodist Youth Fellowship events calendar for Good Shepherd Methodist Church, Kaneshie North Circuit. Subscribe for SMS & email reminders.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 min-h-screen`} suppressHydrationWarning>{children}</body>
    </html>
  )
}
