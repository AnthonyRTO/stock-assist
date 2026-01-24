'use client'

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { HistoricalData } from '@/types'

interface BollingerChartProps {
  data: { date: string; upper: number; middle: number; lower: number }[]
  historicalData: HistoricalData[]
}

export function BollingerChart({ data, historicalData }: BollingerChartProps) {
  const slicedData = data.slice(-30)
  const slicedHistorical = historicalData.slice(-30)

  const chartData = slicedData.map((d, i) => ({
    date: new Date(d.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    upper: d.upper,
    middle: d.middle,
    lower: d.lower,
    price: slicedHistorical[i]?.close || 0,
  }))

  const allValues = chartData.flatMap((d) => [d.upper, d.lower, d.price])
  const minY = Math.min(...allValues) * 0.98
  const maxY = Math.max(...allValues) * 1.02

  return (
    <ResponsiveContainer width="100%" height={150}>
      <ComposedChart data={chartData}>
        <defs>
          <linearGradient id="bollingerGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[minY, maxY]}
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
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
          formatter={(value) => [
            `$${Number(value).toFixed(2)}`,
            '',
          ]}
        />
        <Area
          type="monotone"
          dataKey="upper"
          stroke="transparent"
          fill="url(#bollingerGradient)"
        />
        <Area
          type="monotone"
          dataKey="lower"
          stroke="transparent"
          fill="rgba(15, 23, 42, 1)"
        />
        <Line
          type="monotone"
          dataKey="upper"
          stroke="#8b5cf6"
          strokeWidth={1}
          strokeDasharray="3 3"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="middle"
          stroke="#8b5cf6"
          strokeWidth={1}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="lower"
          stroke="#8b5cf6"
          strokeWidth={1}
          strokeDasharray="3 3"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
