import { HistoricalData, BollingerBandsData } from '@/types'

function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return 0
  const slice = prices.slice(-period)
  return slice.reduce((sum, price) => sum + price, 0) / period
}

function calculateStdDev(prices: number[], period: number): number {
  if (prices.length < period) return 0
  const slice = prices.slice(-period)
  const mean = slice.reduce((sum, p) => sum + p, 0) / period
  const squaredDiffs = slice.map((p) => Math.pow(p - mean, 2))
  const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / period
  return Math.sqrt(variance)
}

export function calculateBollingerBands(
  data: HistoricalData[],
  period: number = 20,
  stdDevMultiplier: number = 2
): BollingerBandsData {
  if (data.length < period) {
    return {
      upper: 0,
      middle: 0,
      lower: 0,
      percentB: 50,
      signal: 'neutral',
      history: [],
    }
  }

  const closePrices = data.map((d) => d.close)
  const history: { date: string; upper: number; middle: number; lower: number }[] = []

  for (let i = period - 1; i < data.length; i++) {
    const slice = closePrices.slice(i - period + 1, i + 1)
    const sma = slice.reduce((sum, p) => sum + p, 0) / period
    const mean = sma
    const squaredDiffs = slice.map((p) => Math.pow(p - mean, 2))
    const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / period
    const stdDev = Math.sqrt(variance)

    const upper = sma + stdDevMultiplier * stdDev
    const lower = sma - stdDevMultiplier * stdDev

    history.push({
      date: data[i].date,
      upper: parseFloat(upper.toFixed(2)),
      middle: parseFloat(sma.toFixed(2)),
      lower: parseFloat(lower.toFixed(2)),
    })
  }

  const latest = history[history.length - 1]
  const currentPrice = closePrices[closePrices.length - 1]

  // Percent B: where price is relative to the bands (0 = lower, 100 = upper)
  const percentB =
    latest.upper !== latest.lower
      ? ((currentPrice - latest.lower) / (latest.upper - latest.lower)) * 100
      : 50

  let signal: 'overbought' | 'neutral' | 'oversold' = 'neutral'

  if (percentB >= 80) {
    signal = 'overbought'
  } else if (percentB <= 20) {
    signal = 'oversold'
  }

  return {
    upper: latest.upper,
    middle: latest.middle,
    lower: latest.lower,
    percentB: parseFloat(percentB.toFixed(2)),
    signal,
    history,
  }
}
