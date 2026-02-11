import type { StockQuote, HistoricalData, CompanyOverview } from '@/types'

// Convert Alpha Vantage symbol format to Yahoo Finance format
export function toYahooSymbol(symbol: string): string {
  // TSX: Alpha Vantage uses .TRT, Yahoo uses .TO
  if (symbol.endsWith('.TRT')) {
    return symbol.replace('.TRT', '.TO')
  }
  // TSX: Alpha Vantage uses TSX: prefix
  if (symbol.startsWith('TSX:')) {
    return symbol.replace('TSX:', '') + '.TO'
  }
  // .TO already correct for Yahoo
  if (symbol.endsWith('.TO')) {
    return symbol
  }
  return symbol
}

export async function getYahooQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const yahooFinance = (await import('yahoo-finance2')).default
    const yahooSymbol = toYahooSymbol(symbol)
    const raw: Record<string, unknown> = await yahooFinance.quote(yahooSymbol) as Record<string, unknown>

    if (!raw || !raw.regularMarketPrice) return null

    return {
      symbol: symbol,
      name: (raw.shortName || raw.longName || symbol) as string,
      price: raw.regularMarketPrice as number,
      change: (raw.regularMarketChange || 0) as number,
      changePercent: (raw.regularMarketChangePercent || 0) as number,
      volume: (raw.regularMarketVolume || 0) as number,
      high: (raw.regularMarketDayHigh || raw.regularMarketPrice) as number,
      low: (raw.regularMarketDayLow || raw.regularMarketPrice) as number,
      open: (raw.regularMarketOpen || raw.regularMarketPrice) as number,
      previousClose: (raw.regularMarketPreviousClose || raw.regularMarketPrice) as number,
      exchange: (raw.exchange || 'US') as string,
    }
  } catch (error) {
    console.error('Yahoo Finance quote error:', error)
    return null
  }
}

export async function getYahooHistoricalData(
  symbol: string,
  months: number = 3
): Promise<HistoricalData[]> {
  try {
    const yahooFinance = (await import('yahoo-finance2')).default
    const yahooSymbol = toYahooSymbol(symbol)

    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const result = await yahooFinance.chart(yahooSymbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d' as const,
    }) as { quotes?: Array<Record<string, unknown>> }

    if (!result?.quotes || result.quotes.length === 0) return []

    return result.quotes
      .filter((q) => q.date && q.close !== null && q.close !== undefined)
      .map((q) => ({
        date: (q.date as Date).toISOString().split('T')[0],
        open: (q.open as number) || 0,
        high: (q.high as number) || 0,
        low: (q.low as number) || 0,
        close: (q.close as number) || 0,
        volume: (q.volume as number) || 0,
      }))
      .sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
  } catch (error) {
    console.error('Yahoo Finance historical error:', error)
    return []
  }
}

export async function getYahooCompanyOverview(symbol: string): Promise<CompanyOverview | null> {
  try {
    const yahooFinance = (await import('yahoo-finance2')).default
    const yahooSymbol = toYahooSymbol(symbol)

    const summary = await yahooFinance.quoteSummary(yahooSymbol, {
      modules: [
        'defaultKeyStatistics',
        'financialData',
        'summaryDetail',
        'summaryProfile',
        'price',
      ],
    }) as Record<string, Record<string, unknown>> | null

    if (!summary) return null

    const stats = summary.defaultKeyStatistics as Record<string, unknown> | undefined
    const financial = summary.financialData as Record<string, unknown> | undefined
    const detail = summary.summaryDetail as Record<string, unknown> | undefined
    const profile = summary.summaryProfile as Record<string, unknown> | undefined
    const priceData = summary.price as Record<string, unknown> | undefined

    // Need at least some basic data
    if (!stats && !financial && !detail) return null

    const peRatio = (detail?.trailingPE as number) || 0
    const currentPrice = (financial?.currentPrice as number) || (priceData?.regularMarketPrice as number) || 0
    const eps = peRatio > 0 && currentPrice > 0 ? currentPrice / peRatio : 0

    return {
      symbol: symbol,
      name: ((priceData?.shortName || priceData?.longName || symbol) as string),
      description: ((profile?.longBusinessSummary || '') as string),
      sector: ((profile?.sector || 'Unknown') as string),
      industry: ((profile?.industry || 'Unknown') as string),
      marketCap: (detail?.marketCap as number) || 0,
      beta: (stats?.beta as number) || 1,
      peRatio: peRatio,
      forwardPE: (stats?.forwardPE as number) || 0,
      pegRatio: (stats?.pegRatio as number) || 0,
      eps: eps,
      bookValue: (stats?.bookValue as number) || 0,
      dividendYield: (detail?.dividendYield as number) || 0,
      profitMargin: (financial?.profitMargins as number) || 0,
      operatingMargin: (financial?.operatingMargins as number) || 0,
      returnOnEquity: (financial?.returnOnEquity as number) || 0,
      revenuePerShare: (financial?.revenuePerShare as number) || 0,
      analystTargetPrice: (financial?.targetMeanPrice as number) || 0,
      fiftyTwoWeekHigh: (detail?.fiftyTwoWeekHigh as number) || 0,
      fiftyTwoWeekLow: (detail?.fiftyTwoWeekLow as number) || 0,
      sharesOutstanding: (stats?.sharesOutstanding as number) || 0,
    }
  } catch (error) {
    console.error('Yahoo Finance overview error:', error)
    return null
  }
}
