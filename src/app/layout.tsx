import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MVP Skeleton',
  description: 'Enterprise SaaS Skeleton by MAK Software Solutions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-neutral-50 text-neutral-900">
        {children}
      </body>
    </html>
  )
}
