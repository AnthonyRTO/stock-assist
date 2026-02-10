import { NextResponse } from 'next/server'
import {
  getStockQuote,
  getHistoricalData,
  getCompanyOverview,
  generateMockHistoricalData,
} from '@/lib/alpha-vantage'
import { calculateAllIndicators, generatePrediction, calculateValuation } from '@/lib/indicators'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params
    const upperSymbol = symbol.toUpperCase()

    // Get current quote
    const quote = await getStockQuote(upperSymbol)

    // Get historical data and company overview in parallel
    const [historicalDataRaw, overview] = await Promise.all([
      getHistoricalData(upperSymbol, 3),
      getCompanyOverview(upperSymbol),
    ])

    // If no data (API limit), use mock data for demo
    let historicalData = historicalDataRaw
    if (historicalData.length === 0) {
      historicalData = generateMockHistoricalData(3)
    }

    // Calculate technical indicators
    const indicators = calculateAllIndicators(historicalData)

    // Generate prediction
    const prediction = generatePrediction(historicalData, indicators)

    // Calculate valuation if overview data is available
    const currentPrice = quote?.price || historicalData[historicalData.length - 1]?.close || 0
    const valuation = overview ? calculateValuation(overview, currentPrice) : null

    return NextResponse.json({
      symbol: upperSymbol,
      quote: quote || {
        symbol: upperSymbol,
        name: upperSymbol,
        price: historicalData[historicalData.length - 1]?.close || 0,
        change: 0,
        changePercent: 0,
        volume: historicalData[historicalData.length - 1]?.volume || 0,
        high: historicalData[historicalData.length - 1]?.high || 0,
        low: historicalData[historicalData.length - 1]?.low || 0,
        open: historicalData[historicalData.length - 1]?.open || 0,
        previousClose: historicalData[historicalData.length - 2]?.close || 0,
        exchange: 'US',
      },
      historicalData,
      indicators,
      prediction,
      valuation,
    })
  } catch (error) {
    console.error('Stock data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    )
  }
}
