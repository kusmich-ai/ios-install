// app/layout.tsx - FIXED VERSION
import './globals.css'

export const metadata = {
  title: 'Unbecoming',
  description: 'IOS System Installation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // DON'T check auth in layout - it makes ALL pages dynamic
  // Let individual pages handle their own auth needs
  
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
