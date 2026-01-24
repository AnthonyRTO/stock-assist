import { HistoricalData, Prediction, TechnicalIndicators } from '@/types'
import { calculateRSI } from './rsi'
import { calculateMACD } from './macd'
import { calculateMovingAverages } from './moving-averages'
import { calculateBollingerBands } from './bollinger'
import { calculateVolumeAnalysis } from './volume'

export function calculateAllIndicators(data: HistoricalData[]): TechnicalIndicators {
  return {
    rsi: calculateRSI(data),
    macd: calculateMACD(data),
    movingAverages: calculateMovingAverages(data),
    bollingerBands: calculateBollingerBands(data),
    volume: calculateVolumeAnalysis(data),
  }
}

export function generatePrediction(
  data: HistoricalData[],
  indicators: TechnicalIndicators
): Prediction {
  const currentPrice = data[data.length - 1]?.close || 0

  // Score each indicator (-2 to +2)
  let totalScore = 0
  let maxScore = 10 // 5 indicators * 2

  // RSI Score
  if (indicators.rsi.signal === 'oversold') {
    totalScore += 2 // Buy signal
  } else if (indicators.rsi.signal === 'overbought') {
    totalScore -= 2 // Sell signal
  } else if (indicators.rsi.value < 45) {
    totalScore += 1
  } else if (indicators.rsi.value > 55) {
    totalScore -= 1
  }

  // MACD Score
  if (indicators.macd.trend === 'bullish') {
    totalScore += 2
    if (indicators.macd.histogram > 0) totalScore += 0.5
  } else if (indicators.macd.trend === 'bearish') {
    totalScore -= 2
    if (indicators.macd.histogram < 0) totalScore -= 0.5
  }

  // Moving Averages Score
  if (indicators.movingAverages.signal === 'bullish') {
    totalScore += 2
  } else if (indicators.movingAverages.signal === 'bearish') {
    totalScore -= 2
  }
  if (indicators.movingAverages.priceVsSMA20 === 'above') totalScore += 0.5
  if (indicators.movingAverages.priceVsSMA50 === 'above') totalScore += 0.5

  // Bollinger Bands Score
  if (indicators.bollingerBands.signal === 'oversold') {
    totalScore += 2 // Near lower band - potential buy
  } else if (indicators.bollingerBands.signal === 'overbought') {
    totalScore -= 1 // Near upper band - caution
  }

  // Volume Score
  if (indicators.volume.trend === 'above_average') {
    // High volume confirms trend
    if (totalScore > 0) totalScore += 1
    else if (totalScore < 0) totalScore -= 1
  }

  // Normalize score to percentage
  const normalizedScore = ((totalScore + maxScore) / (2 * maxScore)) * 100
  const confidence = Math.min(95, Math.max(20, normalizedScore))

  // Determine signal
  let signal: Prediction['signal'] = 'hold'
  if (totalScore >= 5) signal = 'strong_buy'
  else if (totalScore >= 2) signal = 'buy'
  else if (totalScore <= -5) signal = 'strong_sell'
  else if (totalScore <= -2) signal = 'sell'

  // Calculate price projections (5 months)
  const volatility = calculateVolatility(data)
  const trendStrength = totalScore / maxScore
  const monthlyGrowth = 0.02 + trendStrength * 0.03 // 2-5% monthly based on trend

  const projectedPrices: Prediction['projectedPrices'] = []
  let projectedPrice = currentPrice

  for (let month = 1; month <= 5; month++) {
    projectedPrice *= 1 + monthlyGrowth
    const range = projectedPrice * volatility * Math.sqrt(month / 12)

    projectedPrices.push({
      date: getMonthLabel(month),
      low: parseFloat((projectedPrice - range).toFixed(2)),
      mid: parseFloat(projectedPrice.toFixed(2)),
      high: parseFloat((projectedPrice + range).toFixed(2)),
    })
  }

  // Calculate buy and sell zones
  const buyZone = {
    low: parseFloat((currentPrice * 0.95).toFixed(2)),
    high: parseFloat((currentPrice * 0.98).toFixed(2)),
  }

  const targetPrice = projectedPrices[projectedPrices.length - 1]
  const sellZone = {
    low: parseFloat((targetPrice.mid * 0.95).toFixed(2)),
    high: parseFloat((targetPrice.high * 0.98).toFixed(2)),
  }

  return {
    targetPrice: {
      low: targetPrice.low,
      mid: targetPrice.mid,
      high: targetPrice.high,
    },
    buyZone,
    sellZone,
    signal,
    confidence: parseFloat(confidence.toFixed(0)),
    projectedPrices,
  }
}

function calculateVolatility(data: HistoricalData[]): number {
  if (data.length < 20) return 0.15

  const returns: number[] = []
  for (let i = 1; i < data.length; i++) {
    returns.push((data[i].close - data[i - 1].close) / data[i - 1].close)
  }

  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const squaredDiffs = returns.map((r) => Math.pow(r - mean, 2))
  const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / returns.length
  const dailyVolatility = Math.sqrt(variance)

  // Annualize volatility
  return dailyVolatility * Math.sqrt(252)
}

function getMonthLabel(monthsFromNow: number): string {
  const date = new Date()
  date.setMonth(date.getMonth() + monthsFromNow)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function getSignalColor(signal: Prediction['signal']): string {
  switch (signal) {
    case 'strong_buy':
      return 'text-green-500'
    case 'buy':
      return 'text-green-400'
    case 'hold':
      return 'text-yellow-400'
    case 'sell':
      return 'text-red-400'
    case 'strong_sell':
      return 'text-red-500'
    default:
      return 'text-gray-400'
  }
}

export function getSignalLabel(signal: Prediction['signal']): string {
  switch (signal) {
    case 'strong_buy':
      return 'Strong Buy'
    case 'buy':
      return 'Buy'
    case 'hold':
      return 'Hold'
    case 'sell':
      return 'Sell'
    case 'strong_sell':
      return 'Strong Sell'
    default:
      return 'Unknown'
  }
}
