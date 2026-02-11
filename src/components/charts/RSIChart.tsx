'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface RSIChartProps {
  data: { date: string; value: number }[]
}

export function RSIChart({ data }: RSIChartProps) {
  const chartData = data.slice(-30).map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    value: d.value,
  }))

  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={chartData}>
        <XAxis
          dataKey="date"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
          ticks={[30, 50, 70]}
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
          formatter={((value: number) => [value.toFixed(1), 'RSI']) as any}
        />
        <ReferenceLine
          y={70}
          stroke="rgba(239, 68, 68, 0.5)"
          strokeDasharray="3 3"
        />
        <ReferenceLine
          y={30}
          stroke="rgba(34, 197, 94, 0.5)"
          strokeDasharray="3 3"
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#a855f7"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
