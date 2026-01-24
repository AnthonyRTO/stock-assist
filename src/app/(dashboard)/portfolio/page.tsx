'use client'

import { useState } from 'react'
import useSWR from 'swr'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Edit3,
  Loader2,
  History,
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

interface Transaction {
  id: string
  type: string
  symbol: string
  shares: number
  price: number
  total: number
  createdAt: string
}

interface Portfolio {
  id: string
  name: string
  initialFunds: number
  currentCash: number
  stocks: Stock[]
  transactions: Transaction[]
}

export default function PortfolioPage() {
  const { data, mutate, isLoading } = useSWR('/api/portfolio', fetcher)
  const [editingFunds, setEditingFunds] = useState(false)
  const [newFunds, setNewFunds] = useState(0)
  const [saving, setSaving] = useState(false)

  const portfolio: Portfolio | null = data?.portfolios?.[0] || null

  const handleUpdateFunds = async () => {
    if (!portfolio) return
    setSaving(true)

    try {
      await fetch('/api/portfolio', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialFunds: newFunds }),
      })
      mutate()
      setEditingFunds(false)
    } catch (error) {
      console.error('Update funds error:', error)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    )
  }

  const investedValue =
    portfolio?.stocks.reduce((sum, s) => sum + s.shares * s.avgPrice, 0) || 0
  const totalValue = (portfolio?.currentCash || 0) + investedValue
  const gainLoss = totalValue - (portfolio?.initialFunds || 0)
  const gainLossPercent = portfolio?.initialFunds
    ? (gainLoss / portfolio.initialFunds) * 100
    : 0

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Portfolio Management</h1>
        <p className="text-white/60">
          Manage your virtual funds and track your trading performance
        </p>
      </div>

      {/* Fund Management */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <span className="text-white/60">Initial Funds</span>
            </div>
            <button
              onClick={() => {
                setNewFunds(portfolio?.initialFunds || 10000)
                setEditingFunds(true)
              }}
              className="text-white/40 hover:text-white"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-3xl font-bold">
            ${(portfolio?.initialFunds || 0).toLocaleString()}
          </p>
          <p className="text-white/40 text-sm mt-1">Starting capital</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-white/60">Available Cash</span>
          </div>
          <p className="text-3xl font-bold">
            ${(portfolio?.currentCash || 0).toLocaleString()}
          </p>
          <p className="text-white/40 text-sm mt-1">Ready to invest</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            {gainLoss >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            <span className="text-white/60">Total Performance</span>
          </div>
          <p
            className={`text-3xl font-bold ${gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}
          >
            {gainLoss >= 0 ? '+' : ''}${gainLoss.toLocaleString()}
          </p>
          <p className="text-white/40 text-sm mt-1">
            {gainLossPercent >= 0 ? '+' : ''}
            {gainLossPercent.toFixed(2)}% return
          </p>
        </div>
      </div>

      {/* Holdings */}
      <div className="card mb-8">
        <div className="p-4 border-b border-white/10">
          <h2 className="font-semibold">Holdings</h2>
        </div>
        {portfolio?.stocks.length === 0 ? (
          <div className="p-8 text-center text-white/60">
            No stocks in portfolio yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-white/60 text-sm">
                  <th className="p-4">Symbol</th>
                  <th className="p-4">Shares</th>
                  <th className="p-4">Avg Price</th>
                  <th className="p-4">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {portfolio?.stocks.map((stock) => (
                  <tr key={stock.id} className="hover:bg-white/5">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{stock.symbol}</p>
                        <p className="text-sm text-white/60">
                          {stock.name || stock.exchange}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">{stock.shares}</td>
                    <td className="p-4">${stock.avgPrice.toFixed(2)}</td>
                    <td className="p-4 font-medium">
                      ${(stock.shares * stock.avgPrice).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="card">
        <div className="p-4 border-b border-white/10 flex items-center gap-2">
          <History className="w-5 h-5 text-white/60" />
          <h2 className="font-semibold">Recent Transactions</h2>
        </div>
        {portfolio?.transactions?.length === 0 ? (
          <div className="p-8 text-center text-white/60">
            No transactions yet
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {portfolio?.transactions?.map((tx) => (
              <div
                key={tx.id}
                className="p-4 flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'buy'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {tx.type === 'buy' ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {tx.type === 'buy' ? 'Bought' : 'Sold'} {tx.symbol}
                    </p>
                    <p className="text-sm text-white/60">
                      {tx.shares} shares @ ${tx.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-medium ${
                      tx.type === 'buy' ? 'text-red-400' : 'text-green-400'
                    }`}
                  >
                    {tx.type === 'buy' ? '-' : '+'}${tx.total.toLocaleString()}
                  </p>
                  <p className="text-sm text-white/60">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Funds Modal */}
      {editingFunds && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Update Starting Funds</h2>
            <p className="text-white/60 text-sm mb-4">
              Changing your initial funds will adjust your available cash
              accordingly. This is for simulation purposes.
            </p>

            <div className="mb-4">
              <label className="block text-sm text-white/60 mb-2">
                New Starting Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="number"
                  value={newFunds}
                  onChange={(e) => setNewFunds(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500"
                  min={1000}
                  max={1000000}
                  step={1000}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingFunds(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateFunds}
                disabled={saving}
                className="flex-1 bg-blue-500 hover:bg-blue-600 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : 'Update Funds'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
