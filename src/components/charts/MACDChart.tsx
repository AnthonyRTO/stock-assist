'use client'

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'

interface MACDChartProps {
  data: { date: string; macd: number; signal: number; histogram: number }[]
}

export function MACDChart({ data }: MACDChartProps) {
  const chartData = data.slice(-30).map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    macd: d.macd,
    signal: d.signal,
    histogram: d.histogram,
  }))

  return (
    <ResponsiveContainer width="100%" height={150}>
      <ComposedChart data={chartData}>
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
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
          formatter={(value) => [Number(value).toFixed(2), '']}
        />
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
        <Bar dataKey="histogram" opacity={0.5}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.histogram >= 0 ? '#22c55e' : '#ef4444'}
            />
          ))}
        </Bar>
        <Line
          type="monotone"
          dataKey="macd"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="signal"
          stroke="#f97316"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
