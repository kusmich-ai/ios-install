// app/layout.tsx
import './globals.css'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const metadata = {
  title: 'Unbecoming',
  description: 'IOS System Installation',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Optional: Get session here if you need it in layout
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
