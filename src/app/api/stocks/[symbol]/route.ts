import { NextResponse } from 'next/server'
import {
  getStockQuote,
  getHistoricalData,
  generateMockHistoricalData,
} from '@/lib/alpha-vantage'
import { calculateAllIndicators, generatePrediction } from '@/lib/indicators'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params
    const upperSymbol = symbol.toUpperCase()

    // Get current quote
    const quote = await getStockQuote(upperSymbol)

    // Get historical data (3 months)
    let historicalData = await getHistoricalData(upperSymbol, 3)

    // If no data (API limit), use mock data for demo
    if (historicalData.length === 0) {
      historicalData = generateMockHistoricalData(3)
    }

    // Calculate technical indicators
    const indicators = calculateAllIndicators(historicalData)

    // Generate prediction
    const prediction = generatePrediction(historicalData, indicators)

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
    })
  } catch (error) {
    console.error('Stock data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    )
  }
}
