import { HistoricalData, MACDData } from '@/types'

function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = []
  const multiplier = 2 / (period + 1)

  // First EMA is SMA
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += prices[i]
  }
  ema[period - 1] = sum / period

  // Calculate subsequent EMAs
  for (let i = period; i < prices.length; i++) {
    ema[i] = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1]
  }

  return ema
}

export function calculateMACD(
  data: HistoricalData[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDData {
  if (data.length < slowPeriod + signalPeriod) {
    return {
      macd: 0,
      signal: 0,
      histogram: 0,
      trend: 'neutral',
      history: [],
    }
  }

  const closePrices = data.map((d) => d.close)
  const ema12 = calculateEMA(closePrices, fastPeriod)
  const ema26 = calculateEMA(closePrices, slowPeriod)

  // Calculate MACD line
  const macdLine: number[] = []
  for (let i = slowPeriod - 1; i < closePrices.length; i++) {
    macdLine.push(ema12[i] - ema26[i])
  }

  // Calculate Signal line (9-day EMA of MACD)
  const signalLine = calculateEMA(macdLine, signalPeriod)

  // Build history
  const history: { date: string; macd: number; signal: number; histogram: number }[] = []
  const startIdx = slowPeriod - 1 + signalPeriod - 1

  for (let i = signalPeriod - 1; i < macdLine.length; i++) {
    const dataIdx = slowPeriod - 1 + i
    if (dataIdx < data.length) {
      const macd = macdLine[i]
      const signal = signalLine[i]
      const histogram = macd - signal

      history.push({
        date: data[dataIdx].date,
        macd: parseFloat(macd.toFixed(4)),
        signal: parseFloat(signal.toFixed(4)),
        histogram: parseFloat(histogram.toFixed(4)),
      })
    }
  }

  const latest = history[history.length - 1]
  let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral'

  if (latest) {
    if (latest.histogram > 0 && latest.macd > latest.signal) {
      trend = 'bullish'
    } else if (latest.histogram < 0 && latest.macd < latest.signal) {
      trend = 'bearish'
    }
  }

  return {
    macd: latest?.macd || 0,
    signal: latest?.signal || 0,
    histogram: latest?.histogram || 0,
    trend,
    history,
  }
}
