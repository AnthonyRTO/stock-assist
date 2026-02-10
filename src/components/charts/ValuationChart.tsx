'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'
import type { ValuationModel } from '@/types'

interface ValuationChartProps {
  models: ValuationModel[]
  currentPrice: number
  compositeMid: number
}

export function ValuationChart({ models, currentPrice, compositeMid }: ValuationChartProps) {
  const chartData = models
    .filter(m => m.fairValue !== null && m.fairValue > 0)
    .map(m => ({
      name: m.name,
      fairValue: m.fairValue!,
      color: m.fairValue! > currentPrice ? '#22c55e' : '#ef4444',
    }))

  chartData.push({
    name: 'Composite',
    fairValue: compositeMid,
    color: compositeMid > currentPrice ? '#22c55e' : '#ef4444',
  })

  const allValues = [...chartData.map(d => d.fairValue), currentPrice]
  const minVal = Math.min(...allValues) * 0.85
  const maxVal = Math.max(...allValues) * 1.15

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
        <XAxis
          type="number"
          domain={[minVal, maxVal]}
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
          tickFormatter={(value) => `$${value.toFixed(0)}`}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
          width={100}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={((value: number) => [`$${value.toFixed(2)}`, 'Fair Value']) as any}
        />
        <ReferenceLine
          x={currentPrice}
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="5 5"
          label={{
            value: `Current $${currentPrice.toFixed(2)}`,
            fill: '#3b82f6',
            fontSize: 10,
            position: 'top',
          }}
        />
        <Bar dataKey="fairValue" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.color} fillOpacity={0.7} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
