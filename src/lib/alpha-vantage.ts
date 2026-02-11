import { CompanyOverview, HistoricalData, StockQuote } from '@/types'
import { getYahooQuote, getYahooHistoricalData, getYahooCompanyOverview } from './yahoo-finance'

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo'
const BASE_URL = 'https://www.alphavantage.co/query'

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes

function getCached<T>(key: string): T | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T
  }
  return null
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() })
}

export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  const cacheKey = `quote:${symbol}`
  const cached = getCached<StockQuote>(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    )
    const data = await response.json()

    if (data['Global Quote'] && Object.keys(data['Global Quote']).length > 0) {
      const quote = data['Global Quote']
      const result: StockQuote = {
        symbol: quote['01. symbol'],
        name: symbol,
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent']?.replace('%', '') || '0'),
        volume: parseInt(quote['06. volume']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        open: parseFloat(quote['02. open']),
        previousClose: parseFloat(quote['08. previous close']),
        exchange: symbol.includes(':') ? symbol.split(':')[0] : 'US',
      }
      setCache(cacheKey, result)
      return result
    }

    // Fallback to Yahoo Finance
    const yahooResult = await getYahooQuote(symbol)
    if (yahooResult) {
      setCache(cacheKey, yahooResult)
      return yahooResult
    }

    return null
  } catch (error) {
    console.error('Error fetching stock quote:', error)
    // Try Yahoo Finance on error
    try {
      const yahooResult = await getYahooQuote(symbol)
      if (yahooResult) {
        setCache(cacheKey, yahooResult)
        return yahooResult
      }
    } catch { /* ignore */ }
    return null
  }
}

export async function getHistoricalData(
  symbol: string,
  months: number = 3
): Promise<HistoricalData[]> {
  const cacheKey = `history:${symbol}:${months}`
  const cached = getCached<HistoricalData[]>(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${API_KEY}`
    )
    const data = await response.json()

    if (data['Time Series (Daily)']) {
      const timeSeries = data['Time Series (Daily)']
      const cutoffDate = new Date()
      cutoffDate.setMonth(cutoffDate.getMonth() - months)

      const result: HistoricalData[] = Object.entries(timeSeries)
        .filter(([date]) => new Date(date) >= cutoffDate)
        .map(([date, values]) => {
          const v = values as Record<string, string>
          return {
            date,
            open: parseFloat(v['1. open']),
            high: parseFloat(v['2. high']),
            low: parseFloat(v['3. low']),
            close: parseFloat(v['4. close']),
            volume: parseInt(v['5. volume']),
          }
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      setCache(cacheKey, result)
      return result
    }

    // Fallback to Yahoo Finance
    const yahooResult = await getYahooHistoricalData(symbol, months)
    if (yahooResult.length > 0) {
      setCache(cacheKey, yahooResult)
      return yahooResult
    }

    return []
  } catch (error) {
    console.error('Error fetching historical data:', error)
    // Try Yahoo Finance on error
    try {
      const yahooResult = await getYahooHistoricalData(symbol, months)
      if (yahooResult.length > 0) {
        setCache(cacheKey, yahooResult)
        return yahooResult
      }
    } catch { /* ignore */ }
    return []
  }
}

export async function searchStocks(query: string): Promise<
  Array<{
    symbol: string
    name: string
    type: string
    region: string
    currency: string
  }>
> {
  const cacheKey = `search:${query}`
  const cached = getCached<Array<{
    symbol: string
    name: string
    type: string
    region: string
    currency: string
  }>>(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${query}&apikey=${API_KEY}`
    )
    const data = await response.json()

    if (data.bestMatches) {
      const result = data.bestMatches.map(
        (match: Record<string, string>) => ({
          symbol: match['1. symbol'],
          name: match['2. name'],
          type: match['3. type'],
          region: match['4. region'],
          currency: match['8. currency'],
        })
      )
      setCache(cacheKey, result)
      return result
    }
    return []
  } catch (error) {
    console.error('Error searching stocks:', error)
    return []
  }
}

export async function getCompanyOverview(symbol: string): Promise<CompanyOverview | null> {
  const cacheKey = `overview:${symbol}`
  const cached = getCached<CompanyOverview>(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`
    )
    const data = await response.json()

    if (!data.Symbol || Object.keys(data).length < 5) {
      // Fallback to Yahoo Finance
      const yahooResult = await getYahooCompanyOverview(symbol)
      if (yahooResult) {
        setCache(cacheKey, yahooResult)
        return yahooResult
      }
      return null
    }

    const result: CompanyOverview = {
      symbol: data.Symbol,
      name: data.Name,
      description: data.Description,
      sector: data.Sector,
      industry: data.Industry,
      marketCap: parseFloat(data.MarketCapitalization) || 0,
      beta: parseFloat(data.Beta) || 1,
      peRatio: parseFloat(data.TrailingPE) || 0,
      forwardPE: parseFloat(data.ForwardPE) || 0,
      pegRatio: parseFloat(data.PEGRatio) || 0,
      eps: parseFloat(data.EPS) || 0,
      bookValue: parseFloat(data.BookValue) || 0,
      dividendYield: parseFloat(data.DividendYield) || 0,
      profitMargin: parseFloat(data.ProfitMargin) || 0,
      operatingMargin: parseFloat(data.OperatingMarginTTM) || 0,
      returnOnEquity: parseFloat(data.ReturnOnEquityTTM) || 0,
      revenuePerShare: parseFloat(data.RevenuePerShareTTM) || 0,
      analystTargetPrice: parseFloat(data.AnalystTargetPrice) || 0,
      fiftyTwoWeekHigh: parseFloat(data['52WeekHigh']) || 0,
      fiftyTwoWeekLow: parseFloat(data['52WeekLow']) || 0,
      sharesOutstanding: parseFloat(data.SharesOutstanding) || 0,
    }
    setCache(cacheKey, result)
    return result
  } catch (error) {
    console.error('Error fetching company overview:', error)
    // Try Yahoo Finance on error
    try {
      const yahooResult = await getYahooCompanyOverview(symbol)
      if (yahooResult) {
        setCache(cacheKey, yahooResult)
        return yahooResult
      }
    } catch { /* ignore */ }
    return null
  }
}

// Generate mock data for demo purposes when API limit is reached
export function generateMockHistoricalData(months: number = 3): HistoricalData[] {
  const data: HistoricalData[] = []
  const today = new Date()
  let price = 150 + Math.random() * 100

  for (let i = months * 22; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue

    const change = (Math.random() - 0.48) * 5
    price = Math.max(50, price + change)

    const high = price + Math.random() * 3
    const low = price - Math.random() * 3
    const open = low + Math.random() * (high - low)
    const close = low + Math.random() * (high - low)

    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(10000000 + Math.random() * 20000000),
    })
  }

  return data
}
