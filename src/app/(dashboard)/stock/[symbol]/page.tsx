'use client'

import { use, useState } from 'react'
import useSWR, { mutate as globalMutate } from 'swr'
import Link from 'next/link'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertTriangle,
  Target,
  ShoppingCart,
  Wallet,
  DollarSign,
  Minus,
  Plus,
} from 'lucide-react'
import { PriceChart } from '@/components/charts/PriceChart'
import { RSIChart } from '@/components/charts/RSIChart'
import { MACDChart } from '@/components/charts/MACDChart'
import { VolumeChart } from '@/components/charts/VolumeChart'
import { BollingerChart } from '@/components/charts/BollingerChart'
import type {
  StockQuote,
  HistoricalData,
  TechnicalIndicators,
  Prediction,
} from '@/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface StockData {
  symbol: string
  quote: StockQuote
  historicalData: HistoricalData[]
  indicators: TechnicalIndicators
  prediction: Prediction
}

interface PortfolioStock {
  id: string
  symbol: string
  shares: number
  avgPrice: number
}

interface Portfolio {
  id: string
  currentCash: number
  stocks: PortfolioStock[]
}

function getSignalBgColor(signal: Prediction['signal']) {
  switch (signal) {
    case 'strong_buy':
      return 'bg-green-500/20 border-green-500/30'
    case 'buy':
      return 'bg-green-500/10 border-green-500/20'
    case 'hold':
      return 'bg-yellow-500/10 border-yellow-500/20'
    case 'sell':
      return 'bg-red-500/10 border-red-500/20'
    case 'strong_sell':
      return 'bg-red-500/20 border-red-500/30'
    default:
      return 'bg-white/5 border-white/10'
  }
}

function getSignalTextColor(signal: Prediction['signal']) {
  switch (signal) {
    case 'strong_buy':
    case 'buy':
      return 'text-green-400'
    case 'hold':
      return 'text-yellow-400'
    case 'sell':
    case 'strong_sell':
      return 'text-red-400'
    default:
      return 'text-white/60'
  }
}

function getSignalLabel(signal: Prediction['signal']) {
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

export default function StockPage({
  params,
}: {
  params: Promise<{ symbol: string }>
}) {
  const { symbol } = use(params)
  const { data, isLoading, error } = useSWR<StockData>(
    `/api/stocks/${symbol}`,
    fetcher
  )
  const { data: portfolioData, mutate: mutatePortfolio } = useSWR<{ portfolios: Portfolio[] }>(
    '/api/portfolio',
    fetcher
  )

  const [shares, setShares] = useState(1)
  const [trading, setTrading] = useState(false)
  const [tradeMessage, setTradeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const portfolio = portfolioData?.portfolios?.[0]
  const holdingStock = portfolio?.stocks.find(
    (s) => s.symbol.toUpperCase() === symbol.toUpperCase()
  )

  const executeTrade = async (action: 'buy' | 'sell') => {
    if (!data?.quote) return
    setTrading(true)
    setTradeMessage(null)

    try {
      const res = await fetch(`/api/portfolio/stocks/${symbol}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, shares }),
      })

      const result = await res.json()

      if (!res.ok) {
        setTradeMessage({ type: 'error', text: result.error || 'Trade failed' })
      } else {
        setTradeMessage({ type: 'success', text: result.message })
        mutatePortfolio()
        globalMutate('/api/portfolio')
        setShares(1)
      }
    } catch {
      setTradeMessage({ type: 'error', text: 'Failed to execute trade' })
    } finally {
      setTrading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Failed to load stock data</h2>
        <p className="text-white/60">Please try again later</p>
      </div>
    )
  }

  const { quote, historicalData, indicators, prediction } = data
  const isPositive = quote.change >= 0
  const estimatedCost = shares * quote.price
  const canBuy = portfolio && estimatedCost <= portfolio.currentCash
  const canSell = holdingStock && shares <= holdingStock.shares

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{quote.symbol}</h1>
              <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-sm">
                {quote.exchange}
              </span>
            </div>
            <p className="text-white/60">{quote.name}</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-3xl font-bold">${quote.price.toFixed(2)}</p>
            <p
              className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}
            >
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {isPositive ? '+' : ''}${quote.change.toFixed(2)} (
              {quote.changePercent.toFixed(2)}%)
            </p>
          </div>
        </div>
      </div>

      {/* Prediction Card */}
      <div
        className={`card p-6 mb-6 ${getSignalBgColor(prediction.signal)}`}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-white/60" />
            <span
              className={`text-xl font-bold ${getSignalTextColor(prediction.signal)}`}
            >
              {getSignalLabel(prediction.signal)} Signal
            </span>
          </div>
          <span className="text-white/40 text-sm">
            Confidence: {prediction.confidence}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <ShoppingCart className="w-5 h-5 text-green-400 mt-1" />
            <div>
              <p className="text-white/60 text-sm">Best Buy Zone</p>
              <p className="text-lg font-bold">
                ${prediction.buyZone.low.toFixed(2)} - $
                {prediction.buyZone.high.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-blue-400 mt-1" />
            <div>
              <p className="text-white/60 text-sm">5-Month Target</p>
              <p className="text-lg font-bold text-green-400">
                ${prediction.targetPrice.low.toFixed(2)} - $
                {prediction.targetPrice.high.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Wallet className="w-5 h-5 text-yellow-400 mt-1" />
            <div>
              <p className="text-white/60 text-sm">Consider Selling</p>
              <p className="text-lg font-bold text-yellow-400">
                Above ${prediction.sellZone.low.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trading Panel */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          Trade {quote.symbol}
        </h2>

        {tradeMessage && (
          <div
            className={`mb-4 p-3 rounded-lg ${
              tradeMessage.type === 'success'
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {tradeMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Account Info */}
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-white/60">Available Cash</span>
              <span className="font-bold text-green-400">
                ${(portfolio?.currentCash || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-white/60">Your Shares</span>
              <span className="font-bold">
                {holdingStock?.shares || 0} shares
              </span>
            </div>
            {holdingStock && holdingStock.shares > 0 && (
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-white/60">Avg Cost Basis</span>
                <span className="font-medium">
                  ${holdingStock.avgPrice.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
              <span className="text-white/60">Current Price</span>
              <span className="font-bold text-blue-400">
                ${quote.price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Right: Trade Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">
                Number of Shares
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShares(Math.max(1, shares - 1))}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={shares}
                  onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-center text-xl font-bold focus:outline-none focus:border-blue-500"
                  min={1}
                />
                <button
                  onClick={() => setShares(shares + 1)}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-lg">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/60">Estimated Total</span>
                <span className="font-bold">${estimatedCost.toLocaleString()}</span>
              </div>
              <div className="text-xs text-white/40">
                {shares} shares × ${quote.price.toFixed(2)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => executeTrade('buy')}
                disabled={trading || !canBuy}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {trading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
                Buy
              </button>
              <button
                onClick={() => executeTrade('sell')}
                disabled={trading || !canSell}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {trading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                Sell
              </button>
            </div>

            {!canBuy && shares > 0 && estimatedCost > (portfolio?.currentCash || 0) && (
              <p className="text-red-400 text-sm text-center">
                Insufficient funds for this purchase
              </p>
            )}
            {!canSell && holdingStock && shares > holdingStock.shares && (
              <p className="text-red-400 text-sm text-center">
                You only have {holdingStock.shares} shares to sell
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Price Chart with Prediction */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          Price History (3 Months) + Prediction (5 Months)
        </h2>
        <PriceChart
          historicalData={historicalData}
          prediction={prediction}
          currentPrice={quote.price}
        />
      </div>

      {/* Technical Indicators */}
      <h2 className="text-xl font-bold mb-4">Technical Indicators</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* RSI */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">RSI (14)</h3>
            <span
              className={`font-bold ${
                indicators.rsi.signal === 'oversold'
                  ? 'text-green-400'
                  : indicators.rsi.signal === 'overbought'
                    ? 'text-red-400'
                    : 'text-yellow-400'
              }`}
            >
              {indicators.rsi.value.toFixed(1)}
            </span>
          </div>
          <RSIChart data={indicators.rsi.history} />
          <div className="flex justify-between text-xs text-white/40 mt-2">
            <span>Oversold (&lt;30)</span>
            <span
              className={
                indicators.rsi.signal === 'oversold'
                  ? 'text-green-400'
                  : indicators.rsi.signal === 'overbought'
                    ? 'text-red-400'
                    : 'text-yellow-400'
              }
            >
              {indicators.rsi.signal.charAt(0).toUpperCase() +
                indicators.rsi.signal.slice(1)}
            </span>
            <span>Overbought (&gt;70)</span>
          </div>
        </div>

        {/* MACD */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">MACD</h3>
            <span
              className={`font-bold ${
                indicators.macd.trend === 'bullish'
                  ? 'text-green-400'
                  : indicators.macd.trend === 'bearish'
                    ? 'text-red-400'
                    : 'text-yellow-400'
              }`}
            >
              {indicators.macd.trend.charAt(0).toUpperCase() +
                indicators.macd.trend.slice(1)}
            </span>
          </div>
          <MACDChart data={indicators.macd.history} />
          <div className="flex gap-4 text-sm mt-2">
            <span className="text-white/60">
              MACD: <span className="text-white">{indicators.macd.macd.toFixed(2)}</span>
            </span>
            <span className="text-white/60">
              Signal: <span className="text-white">{indicators.macd.signal.toFixed(2)}</span>
            </span>
            <span className="text-white/60">
              Histogram:{' '}
              <span
                className={
                  indicators.macd.histogram > 0 ? 'text-green-400' : 'text-red-400'
                }
              >
                {indicators.macd.histogram.toFixed(2)}
              </span>
            </span>
          </div>
        </div>

        {/* Moving Averages */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Moving Averages</h3>
            <span
              className={`font-bold ${
                indicators.movingAverages.signal === 'bullish'
                  ? 'text-green-400'
                  : indicators.movingAverages.signal === 'bearish'
                    ? 'text-red-400'
                    : 'text-yellow-400'
              }`}
            >
              {indicators.movingAverages.signal.charAt(0).toUpperCase() +
                indicators.movingAverages.signal.slice(1)}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-white/60">SMA 20</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  ${indicators.movingAverages.sma20.toFixed(2)}
                </span>
                <span
                  className={`text-sm ${
                    indicators.movingAverages.priceVsSMA20 === 'above'
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  Price {indicators.movingAverages.priceVsSMA20}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-white/60">SMA 50</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  ${indicators.movingAverages.sma50.toFixed(2)}
                </span>
                <span
                  className={`text-sm ${
                    indicators.movingAverages.priceVsSMA50 === 'above'
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  Price {indicators.movingAverages.priceVsSMA50}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-white/60">EMA 20</span>
              <span className="font-medium">
                ${indicators.movingAverages.ema20.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Bollinger Bands */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Bollinger Bands</h3>
            <span
              className={`font-bold ${
                indicators.bollingerBands.signal === 'oversold'
                  ? 'text-green-400'
                  : indicators.bollingerBands.signal === 'overbought'
                    ? 'text-red-400'
                    : 'text-yellow-400'
              }`}
            >
              {indicators.bollingerBands.signal.charAt(0).toUpperCase() +
                indicators.bollingerBands.signal.slice(1)}
            </span>
          </div>
          <BollingerChart
            data={indicators.bollingerBands.history}
            historicalData={historicalData}
          />
          <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
            <div className="text-center">
              <p className="text-white/40">Upper</p>
              <p className="font-medium">${indicators.bollingerBands.upper.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-white/40">Middle</p>
              <p className="font-medium">${indicators.bollingerBands.middle.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-white/40">Lower</p>
              <p className="font-medium">${indicators.bollingerBands.lower.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Volume */}
      <div className="card p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Volume Analysis</h3>
          <span
            className={`font-bold ${
              indicators.volume.trend === 'above_average'
                ? 'text-green-400'
                : indicators.volume.trend === 'below_average'
                  ? 'text-red-400'
                  : 'text-yellow-400'
            }`}
          >
            {indicators.volume.trend === 'above_average'
              ? 'Above Average'
              : indicators.volume.trend === 'below_average'
                ? 'Below Average'
                : 'Average'}
          </span>
        </div>
        <VolumeChart historicalData={historicalData} />
        <div className="flex gap-6 mt-2 text-sm">
          <span className="text-white/60">
            Current:{' '}
            <span className="text-white font-medium">
              {(indicators.volume.current / 1000000).toFixed(1)}M
            </span>
          </span>
          <span className="text-white/60">
            20-Day Avg:{' '}
            <span className="text-white font-medium">
              {(indicators.volume.average20 / 1000000).toFixed(1)}M
            </span>
          </span>
          <span className="text-white/60">
            vs Avg:{' '}
            <span
              className={
                indicators.volume.percentVsAverage > 0
                  ? 'text-green-400'
                  : 'text-red-400'
              }
            >
              {indicators.volume.percentVsAverage > 0 ? '+' : ''}
              {indicators.volume.percentVsAverage.toFixed(1)}%
            </span>
          </span>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="card p-4 bg-yellow-500/10 border-yellow-500/20">
        <p className="text-yellow-400 text-sm font-medium mb-1">
          Educational Purposes Only
        </p>
        <p className="text-white/60 text-xs">
          This analysis is for educational purposes only and should not be
          considered financial advice. All predictions are based on historical
          technical indicators. Past performance does not guarantee future
          results. Always do your own research before making investment
          decisions.
        </p>
      </div>
    </div>
  )
}
