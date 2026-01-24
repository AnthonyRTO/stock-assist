import { HistoricalData, RSIData } from '@/types'

export function calculateRSI(data: HistoricalData[], period: number = 14): RSIData {
  if (data.length < period + 1) {
    return {
      value: 50,
      signal: 'neutral',
      history: [],
    }
  }

  const history: { date: string; value: number }[] = []
  let avgGain = 0
  let avgLoss = 0

  // Calculate initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close
    if (change > 0) {
      avgGain += change
    } else {
      avgLoss += Math.abs(change)
    }
  }

  avgGain /= period
  avgLoss /= period

  // Calculate RSI for each subsequent day
  for (let i = period; i < data.length; i++) {
    if (i > period) {
      const change = data[i].close - data[i - 1].close
      const gain = change > 0 ? change : 0
      const loss = change < 0 ? Math.abs(change) : 0

      avgGain = (avgGain * (period - 1) + gain) / period
      avgLoss = (avgLoss * (period - 1) + loss) / period
    }

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    const rsi = 100 - 100 / (1 + rs)

    history.push({
      date: data[i].date,
      value: parseFloat(rsi.toFixed(2)),
    })
  }

  const currentRSI = history[history.length - 1]?.value || 50
  let signal: 'oversold' | 'neutral' | 'overbought' = 'neutral'

  if (currentRSI <= 30) {
    signal = 'oversold'
  } else if (currentRSI >= 70) {
    signal = 'overbought'
  }

  return {
    value: currentRSI,
    signal,
    history,
  }
}
