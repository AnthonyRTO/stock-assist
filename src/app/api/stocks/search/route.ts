import { NextResponse } from 'next/server'
import { searchStocks } from '@/lib/alpha-vantage'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] })
  }

  try {
    const results = await searchStocks(query)
    return NextResponse.json({ results })
  } catch (error) {
    console.error('Stock search error:', error)
    return NextResponse.json(
      { error: 'Failed to search stocks' },
      { status: 500 }
    )
  }
}
