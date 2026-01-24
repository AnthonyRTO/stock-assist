import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ACCESS_CODE = 'ricci01'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (password === ACCESS_CODE) {
      const cookieStore = await cookies()
      cookieStore.set('site-access', 'granted', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
