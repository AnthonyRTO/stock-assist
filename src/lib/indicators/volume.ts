import { HistoricalData, VolumeData } from '@/types'

export function calculateVolumeAnalysis(data: HistoricalData[], period: number = 20): VolumeData {
  if (data.length < period) {
    return {
      current: 0,
      average20: 0,
      trend: 'average',
      percentVsAverage: 0,
    }
  }

  const volumes = data.map((d) => d.volume)
  const currentVolume = volumes[volumes.length - 1]

  // Calculate 20-day average volume
  const recentVolumes = volumes.slice(-period)
  const avgVolume = recentVolumes.reduce((sum, v) => sum + v, 0) / period

  // Calculate percent difference from average
  const percentVsAverage = ((currentVolume - avgVolume) / avgVolume) * 100

  let trend: 'above_average' | 'below_average' | 'average' = 'average'

  if (percentVsAverage > 20) {
    trend = 'above_average'
  } else if (percentVsAverage < -20) {
    trend = 'below_average'
  }

  return {
    current: currentVolume,
    average20: Math.round(avgVolume),
    trend,
    percentVsAverage: parseFloat(percentVsAverage.toFixed(2)),
  }
}

export function getVolumeHistory(
  data: HistoricalData[]
): { date: string; volume: number; avg: number }[] {
  const history: { date: string; volume: number; avg: number }[] = []

  for (let i = 19; i < data.length; i++) {
    const slice = data.slice(i - 19, i + 1)
    const avg = slice.reduce((sum, d) => sum + d.volume, 0) / 20

    history.push({
      date: data[i].date,
      volume: data[i].volume,
      avg: Math.round(avg),
    })
  }

  return history
}
