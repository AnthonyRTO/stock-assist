'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Plus,
  X,
  Search,
  Loader2,
  ArrowRight,
} from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Stock {
  id: string
  symbol: string
  name: string | null
  exchange: string
  shares: number
  avgPrice: number
}

interface Portfolio {
  id: string
  name: string
  initialFunds: number
  currentCash: number
  stocks: Stock[]
}

export default function DashboardPage() {
  const router = useRouter()
  const { data, mutate, isLoading } = useSWR('/api/portfolio', fetcher)
  const [showAddStock, setShowAddStock] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<
    Array<{ symbol: string; name: string; region: string }>
  >([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState(false)

  // Main search bar state
  const [mainSearch, setMainSearch] = useState('')
  const [mainSearchResults, setMainSearchResults] = useState<
    Array<{ symbol: string; name: string; region: string }>
  >([])
  const [mainSearching, setMainSearching] = useState(false)
  const [showMainResults, setShowMainResults] = useState(false)
  const mainSearchRef = useRef<HTMLDivElement>(null)

  const portfolio: Portfolio | null = data?.portfolios?.[0] || null

  // Close main search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (mainSearchRef.current && !mainSearchRef.current.contains(e.target as Node)) {
        setShowMainResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Main search bar - search for stocks
  useEffect(() => {
    if (mainSearch.length < 1) {
      setMainSearchResults([])
      return
    }

    const timeout = setTimeout(async () => {
      setMainSearching(true)
      try {
        const res = await fetch(`/api/stocks/search?q=${mainSearch}`)
        const data = await res.json()
        setMainSearchResults(data.results || [])
        setShowMainResults(true)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setMainSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [mainSearch])

  // Navigate directly to stock page
  const goToStock = (symbol: string) => {
    setShowMainResults(false)
    setMainSearch('')
    router.push(`/stock/${symbol}`)
  }

  // Handle Enter key - go directly to typed symbol
  const handleMainSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && mainSearch.trim()) {
      goToStock(mainSearch.trim().toUpperCase())
    }
  }

  // Search for stocks (Add Stock modal)
  useEffect(() => {
    if (searchQuery.length < 1) {
      setSearchResults([])
      return
    }

    const timeout = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/stocks/search?q=${searchQuery}`)
        const data = await res.json()
        setSearchResults(data.results || [])
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [searchQuery])

  const addStock = async (symbol: string) => {
    setAdding(true)
    try {
      const res = await fetch('/api/portfolio/stocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, action: 'watch' }),
      })

      if (res.ok) {
        mutate()
        setShowAddStock(false)
        setSearchQuery('')
      }
    } catch (error) {
      console.error('Add stock error:', error)
    } finally {
      setAdding(false)
    }
  }

  const removeStock = async (symbol: string) => {
    try {
      await fetch(`/api/portfolio/stocks/${symbol}`, { method: 'DELETE' })
      mutate()
    } catch (error) {
      console.error('Remove stock error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    )
  }

  const stockCount = portfolio?.stocks.length || 0
  const investedValue = portfolio?.stocks.reduce(
    (sum, s) => sum + s.shares * s.avgPrice,
    0
  ) || 0
  const totalValue = (portfolio?.currentCash || 0) + investedValue
  const gainLoss = totalValue - (portfolio?.initialFunds || 0)
  const gainLossPercent = portfolio?.initialFunds
    ? (gainLoss / portfolio.initialFunds) * 100
    : 0

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-white/60">
          Welcome back! Track your virtual portfolio and analyze stocks.
        </p>
      </div>

      {/* Stock Search Bar */}
      <div className="mb-8" ref={mainSearchRef}>
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-3">Analyze a Stock</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={mainSearch}
              onChange={(e) => setMainSearch(e.target.value)}
              onFocus={() => mainSearchResults.length > 0 && setShowMainResults(true)}
              onKeyDown={handleMainSearchKeyDown}
              placeholder="Enter a stock ticker (e.g., AAPL, TSLA, MSFT) and press Enter"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
            {mainSearching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-blue-400" />
            )}
          </div>

          {/* Search Results Dropdown */}
          {showMainResults && mainSearchResults.length > 0 && (
            <div className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-[#1a1a2e] divide-y divide-white/5">
              {mainSearchResults.map((result) => (
                <button
                  key={result.symbol}
                  onClick={() => goToStock(result.symbol)}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors flex justify-between items-center"
                >
                  <div>
                    <span className="font-semibold text-blue-400">{result.symbol}</span>
                    <span className="text-white/60 text-sm ml-3">{result.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40">{result.region}</span>
                    <ArrowRight className="w-4 h-4 text-white/30" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {mainSearch && !mainSearching && mainSearchResults.length === 0 && showMainResults && (
            <p className="mt-2 text-white/50 text-sm text-center py-2">
              No results found. Press Enter to look up &quot;{mainSearch.toUpperCase()}&quot; directly.
            </p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <span className="text-white/60 text-sm">Total Value</span>
          </div>
          <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
          <p
            className={`text-sm ${gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}
          >
            {gainLoss >= 0 ? '+' : ''}${gainLoss.toLocaleString()} (
            {gainLossPercent.toFixed(1)}%)
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-white/60 text-sm">Available Cash</span>
          </div>
          <p className="text-2xl font-bold">
            ${(portfolio?.currentCash || 0).toLocaleString()}
          </p>
          <p className="text-white/40 text-sm">Ready to invest</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <span className="text-white/60 text-sm">Invested</span>
          </div>
          <p className="text-2xl font-bold">${investedValue.toLocaleString()}</p>
          <p className="text-white/40 text-sm">In {stockCount} stocks</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <span className="text-white/60 text-sm">Stocks</span>
          </div>
          <p className="text-2xl font-bold">{stockCount} / 10</p>
          <p className="text-white/40 text-sm">
            {10 - stockCount} slots remaining
          </p>
        </div>
      </div>

      {/* Portfolio Stocks */}
      <div className="card">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="font-semibold">Your Stocks</h2>
          {stockCount < 10 && (
            <button
              onClick={() => setShowAddStock(true)}
              className="bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Stock
            </button>
          )}
        </div>

        {stockCount === 0 ? (
          <div className="p-8 text-center">
            <BarChart3 className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No stocks yet</h3>
            <p className="text-white/60 text-sm mb-4">
              Add stocks to your watchlist to start tracking and analyzing
            </p>
            <button
              onClick={() => setShowAddStock(true)}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Your First Stock
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {portfolio?.stocks.map((stock) => (
              <Link
                href={`/stock/${stock.symbol}`}
                key={stock.id}
                className="p-4 hover:bg-white/5 flex justify-between items-center transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{stock.symbol}</p>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded">
                      {stock.exchange}
                    </span>
                  </div>
                  <p className="text-sm text-white/60">
                    {stock.name || stock.symbol}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">
                      {stock.shares > 0
                        ? `${stock.shares} shares`
                        : 'Watching'}
                    </p>
                    {stock.shares > 0 && (
                      <p className="text-sm text-white/60">
                        Avg: ${stock.avgPrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      removeStock(stock.symbol)
                    }}
                    className="text-white/40 hover:text-red-400 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Add Stock Modal */}
      {showAddStock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Stock</h2>
              <button
                onClick={() => {
                  setShowAddStock(false)
                  setSearchQuery('')
                }}
                className="text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by symbol (e.g., AAPL, TSX:RY)"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            {searching && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {searchResults.map((result) => (
                  <button
                    key={result.symbol}
                    onClick={() => addStock(result.symbol)}
                    disabled={adding}
                    className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{result.symbol}</p>
                        <p className="text-sm text-white/60 truncate">
                          {result.name}
                        </p>
                      </div>
                      <span className="text-xs text-white/40">
                        {result.region}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchQuery && !searching && searchResults.length === 0 && (
              <p className="text-center text-white/60 py-4">
                No stocks found. Try a different search term.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
