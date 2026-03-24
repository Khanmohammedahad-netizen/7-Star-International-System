import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers/Providers'

export const metadata: Metadata = {
  title: '7STAR OS',
  description: 'Enterprise Event Operations System by MAK Software Solutions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-black text-neutral-100 selection:bg-white/10">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
