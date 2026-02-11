'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { HistoricalData } from '@/types'

interface VolumeChartProps {
  historicalData: HistoricalData[]
}

export function VolumeChart({ historicalData }: VolumeChartProps) {
  const data = historicalData.slice(-30)

  // Calculate 20-day average
  const avg20 =
    data.slice(-20).reduce((sum, d) => sum + d.volume, 0) / Math.min(20, data.length)

  const chartData = data.map((d, i) => {
    const prevClose = i > 0 ? data[i - 1].close : d.open
    return {
      date: new Date(d.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      volume: d.volume,
      isUp: d.close >= prevClose,
    }
  })

  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="date"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
          tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
          itemStyle={{ color: '#ffffff' }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={((value: number) => [
            `${(value / 1000000).toFixed(2)}M`,
            'Volume',
          ]) as any}
        />
        <ReferenceLine
          y={avg20}
          stroke="rgba(255,255,255,0.4)"
          strokeDasharray="3 3"
          label={{
            value: 'Avg',
            fill: 'rgba(255,255,255,0.5)',
            fontSize: 10,
          }}
        />
        <Bar
          dataKey="volume"
          fill="#3b82f6"
          opacity={0.7}
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
