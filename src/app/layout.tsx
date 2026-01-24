import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Stock-Assist | Learn Stock Trading',
  description:
    'A fun app to help you learn stock trading with technical analysis and predictions',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-900 text-white min-h-screen`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
