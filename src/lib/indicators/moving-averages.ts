import { HistoricalData, MovingAveragesData } from '@/types'

function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return 0
  const slice = prices.slice(-period)
  return slice.reduce((sum, price) => sum + price, 0) / period
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return 0

  const multiplier = 2 / (period + 1)
  let ema = prices.slice(0, period).reduce((sum, p) => sum + p, 0) / period

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema
  }

  return ema
}

export function calculateMovingAverages(data: HistoricalData[]): MovingAveragesData {
  if (data.length < 50) {
    return {
      sma20: 0,
      sma50: 0,
      ema20: 0,
      priceVsSMA20: 'above',
      priceVsSMA50: 'above',
      signal: 'neutral',
    }
  }

  const closePrices = data.map((d) => d.close)
  const currentPrice = closePrices[closePrices.length - 1]

  const sma20 = calculateSMA(closePrices, 20)
  const sma50 = calculateSMA(closePrices, 50)
  const ema20 = calculateEMA(closePrices, 20)

  const priceVsSMA20: 'above' | 'below' = currentPrice >= sma20 ? 'above' : 'below'
  const priceVsSMA50: 'above' | 'below' = currentPrice >= sma50 ? 'above' : 'below'

  let signal: 'bullish' | 'bearish' | 'neutral' = 'neutral'

  // Golden cross (bullish) - price above both MAs and SMA20 > SMA50
  if (priceVsSMA20 === 'above' && priceVsSMA50 === 'above' && sma20 > sma50) {
    signal = 'bullish'
  }
  // Death cross (bearish) - price below both MAs and SMA20 < SMA50
  else if (priceVsSMA20 === 'below' && priceVsSMA50 === 'below' && sma20 < sma50) {
    signal = 'bearish'
  }

  return {
    sma20: parseFloat(sma20.toFixed(2)),
    sma50: parseFloat(sma50.toFixed(2)),
    ema20: parseFloat(ema20.toFixed(2)),
    priceVsSMA20,
    priceVsSMA50,
    signal,
  }
}

export function calculateSMAHistory(
  data: HistoricalData[],
  period: number
): { date: string; value: number }[] {
  const history: { date: string; value: number }[] = []
  const closePrices = data.map((d) => d.close)

  for (let i = period - 1; i < data.length; i++) {
    const slice = closePrices.slice(i - period + 1, i + 1)
    const sma = slice.reduce((sum, p) => sum + p, 0) / period
    history.push({
      date: data[i].date,
      value: parseFloat(sma.toFixed(2)),
    })
  }

  return history
}
