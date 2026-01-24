export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  open: number
  previousClose: number
  exchange: string
}

export interface HistoricalData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface TechnicalIndicators {
  rsi: RSIData
  macd: MACDData
  movingAverages: MovingAveragesData
  bollingerBands: BollingerBandsData
  volume: VolumeData
}

export interface RSIData {
  value: number
  signal: 'oversold' | 'neutral' | 'overbought'
  history: { date: string; value: number }[]
}

export interface MACDData {
  macd: number
  signal: number
  histogram: number
  trend: 'bullish' | 'bearish' | 'neutral'
  history: { date: string; macd: number; signal: number; histogram: number }[]
}

export interface MovingAveragesData {
  sma20: number
  sma50: number
  ema20: number
  priceVsSMA20: 'above' | 'below'
  priceVsSMA50: 'above' | 'below'
  signal: 'bullish' | 'bearish' | 'neutral'
}

export interface BollingerBandsData {
  upper: number
  middle: number
  lower: number
  percentB: number
  signal: 'overbought' | 'neutral' | 'oversold'
  history: { date: string; upper: number; middle: number; lower: number }[]
}

export interface VolumeData {
  current: number
  average20: number
  trend: 'above_average' | 'below_average' | 'average'
  percentVsAverage: number
}

export interface Prediction {
  targetPrice: { low: number; mid: number; high: number }
  buyZone: { low: number; high: number }
  sellZone: { low: number; high: number }
  signal: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell'
  confidence: number
  projectedPrices: { date: string; low: number; mid: number; high: number }[]
}

export interface PortfolioStock {
  id: string
  symbol: string
  name: string | null
  exchange: string
  shares: number
  avgPrice: number
  currentPrice?: number
  totalValue?: number
  gainLoss?: number
  gainLossPercent?: number
}

export interface Portfolio {
  id: string
  name: string
  initialFunds: number
  currentCash: number
  isSimulation: boolean
  stocks: PortfolioStock[]
  totalValue?: number
  totalGainLoss?: number
  totalGainLossPercent?: number
}

export interface Transaction {
  id: string
  type: 'buy' | 'sell'
  symbol: string
  shares: number
  price: number
  total: number
  createdAt: Date
}
