'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceLine,
} from 'recharts'
import type { HistoricalData, Prediction } from '@/types'

interface PriceChartProps {
  historicalData: HistoricalData[]
  prediction: Prediction
  currentPrice: number
}

export function PriceChart({
  historicalData,
  prediction,
  currentPrice,
}: PriceChartProps) {
  // Prepare historical data
  const historical = historicalData.slice(-60).map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    price: d.close,
    type: 'historical',
  }))

  // Add current price as bridge
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  // Prepare prediction data
  const predictions = prediction.projectedPrices.map((p) => ({
    date: p.date,
    predicted: p.mid,
    predictedLow: p.low,
    predictedHigh: p.high,
    type: 'prediction',
  }))

  // Combine data
  const chartData = [
    ...historical,
    {
      date: today,
      price: currentPrice,
      predicted: currentPrice,
      predictedLow: currentPrice,
      predictedHigh: currentPrice,
      type: 'bridge',
    },
    ...predictions,
  ]

  const allPrices = [
    ...historicalData.map((d) => d.close),
    ...prediction.projectedPrices.flatMap((p) => [p.low, p.high]),
  ]
  const minPrice = Math.min(...allPrices) * 0.95
  const maxPrice = Math.max(...allPrices) * 1.05

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData}>
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[minPrice, maxPrice]}
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
          tickFormatter={(value) => `$${value.toFixed(0)}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
          formatter={(value) => [`$${Number(value).toFixed(2)}`, '']}
        />
        <ReferenceLine
          x={today}
          stroke="rgba(255,255,255,0.3)"
          strokeDasharray="3 3"
          label={{
            value: 'Today',
            fill: 'rgba(255,255,255,0.5)',
            fontSize: 10,
          }}
        />
        {/* Historical price line */}
        <Area
          type="monotone"
          dataKey="price"
          stroke="#3b82f6"
          fill="url(#priceGradient)"
          strokeWidth={2}
          dot={false}
          connectNulls={false}
        />
        {/* Prediction range */}
        <Area
          type="monotone"
          dataKey="predictedHigh"
          stroke="transparent"
          fill="url(#predictionGradient)"
          dot={false}
          connectNulls={false}
        />
        <Area
          type="monotone"
          dataKey="predictedLow"
          stroke="transparent"
          fill="rgba(15, 23, 42, 1)"
          dot={false}
          connectNulls={false}
        />
        {/* Prediction line */}
        <Line
          type="monotone"
          dataKey="predicted"
          stroke="#22c55e"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          connectNulls={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
