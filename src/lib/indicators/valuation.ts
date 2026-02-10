import { CompanyOverview, ValuationData, ValuationModel } from '@/types'

const RISK_FREE_RATE = 0.0425
const MARKET_RETURN = 0.10
const GRAHAM_MULTIPLIER = 22.5

const SECTOR_PE: Record<string, number> = {
  'Technology': 28,
  'Healthcare': 22,
  'Financial Services': 14,
  'Consumer Cyclical': 20,
  'Consumer Defensive': 22,
  'Energy': 12,
  'Industrials': 18,
  'Basic Materials': 15,
  'Real Estate': 35,
  'Utilities': 18,
  'Communication Services': 20,
}
const DEFAULT_SECTOR_PE = 20

export function calculateValuation(
  overview: CompanyOverview,
  currentPrice: number
): ValuationData {
  const models: ValuationModel[] = []

  const capmExpectedReturn = RISK_FREE_RATE + overview.beta * (MARKET_RETURN - RISK_FREE_RATE)

  // 1. Graham Number
  const grahamValue = calculateGrahamNumber(overview)
  models.push({
    name: 'Graham Number',
    fairValue: grahamValue,
    description: 'sqrt(22.5 × EPS × Book Value) — Benjamin Graham\'s intrinsic value formula',
    confidence: grahamValue !== null && overview.eps > 0 && overview.bookValue > 0 ? 'medium' : 'low',
  })

  // 2. P/E Fair Value
  const sectorPE = SECTOR_PE[overview.sector] || DEFAULT_SECTOR_PE
  const peFairValue = calculatePEFairValue(overview, sectorPE)
  models.push({
    name: 'P/E Fair Value',
    fairValue: peFairValue,
    description: `EPS × sector avg P/E (${sectorPE} for ${overview.sector || 'Market'})`,
    confidence: peFairValue !== null && overview.peRatio > 0 ? 'medium' : 'low',
  })

  // 3. Simple DCF
  const dcfValue = calculateSimpleDCF(overview, capmExpectedReturn)
  models.push({
    name: 'Simple DCF',
    fairValue: dcfValue,
    description: 'Discounted cash flow using CAPM rate and PEG-implied growth',
    confidence: dcfValue !== null ? 'medium' : 'low',
  })

  // 4. Analyst Target
  const analystTarget = overview.analystTargetPrice > 0 ? overview.analystTargetPrice : null
  models.push({
    name: 'Analyst Target',
    fairValue: analystTarget,
    description: 'Consensus analyst 12-month price target',
    confidence: analystTarget !== null ? 'high' : 'low',
  })

  // 5. ROE-Based Value
  const roeValue = calculateROEValuation(overview)
  models.push({
    name: 'ROE-Based Value',
    fairValue: roeValue,
    description: 'Book Value × (1 + ROE) / discount rate — earnings power model',
    confidence: roeValue !== null && overview.returnOnEquity > 0 ? 'medium' : 'low',
  })

  const composite = calculateComposite(models, currentPrice)

  const percentDiff = composite.mid > 0
    ? ((currentPrice - composite.mid) / composite.mid) * 100
    : 0

  let verdict: ValuationData['verdict'] = 'fairly_valued'
  if (percentDiff <= -25) verdict = 'significantly_undervalued'
  else if (percentDiff <= -10) verdict = 'undervalued'
  else if (percentDiff >= 25) verdict = 'significantly_overvalued'
  else if (percentDiff >= 10) verdict = 'overvalued'

  return {
    beta: overview.beta,
    currentPrice,
    capmExpectedReturn: parseFloat((capmExpectedReturn * 100).toFixed(2)),
    models,
    compositeFairValue: composite,
    percentOverUndervalued: parseFloat(percentDiff.toFixed(2)),
    verdict,
    overview,
  }
}

function calculateGrahamNumber(overview: CompanyOverview): number | null {
  if (overview.eps <= 0 || overview.bookValue <= 0) return null
  const value = Math.sqrt(GRAHAM_MULTIPLIER * overview.eps * overview.bookValue)
  return parseFloat(value.toFixed(2))
}

function calculatePEFairValue(overview: CompanyOverview, sectorPE: number): number | null {
  if (overview.eps <= 0) return null
  return parseFloat((overview.eps * sectorPE).toFixed(2))
}

function calculateSimpleDCF(
  overview: CompanyOverview,
  discountRate: number
): number | null {
  if (overview.eps <= 0 || discountRate <= 0) return null

  let growthRate = 0.08
  if (overview.pegRatio > 0 && overview.peRatio > 0) {
    growthRate = (overview.peRatio / overview.pegRatio) / 100
    growthRate = Math.min(growthRate, 0.30)
    growthRate = Math.max(growthRate, 0.02)
  }

  const terminalGrowth = 0.025
  const projectionYears = 5
  let totalPV = 0
  let futureEPS = overview.eps

  for (let year = 1; year <= projectionYears; year++) {
    futureEPS *= (1 + growthRate)
    totalPV += futureEPS / Math.pow(1 + discountRate, year)
  }

  const terminalEPS = futureEPS * (1 + terminalGrowth)
  const terminalValue = terminalEPS / (discountRate - terminalGrowth)
  const terminalPV = terminalValue / Math.pow(1 + discountRate, projectionYears)

  const fairValue = totalPV + terminalPV
  if (!isFinite(fairValue) || fairValue <= 0) return null

  return parseFloat(fairValue.toFixed(2))
}

function calculateROEValuation(overview: CompanyOverview): number | null {
  if (overview.bookValue <= 0 || overview.returnOnEquity <= 0) return null
  const discountRate = RISK_FREE_RATE + overview.beta * (MARKET_RETURN - RISK_FREE_RATE)
  if (discountRate <= 0) return null

  const value = overview.bookValue * (1 + overview.returnOnEquity) / discountRate
  if (!isFinite(value) || value <= 0) return null
  return parseFloat(Math.min(value, overview.bookValue * 20).toFixed(2))
}

function calculateComposite(
  models: ValuationModel[],
  currentPrice: number
): { low: number; mid: number; high: number } {
  const validModels = models.filter(m => m.fairValue !== null && m.fairValue > 0)
  if (validModels.length === 0) {
    return { low: currentPrice, mid: currentPrice, high: currentPrice }
  }

  const weights: Record<string, number> = {
    high: 3,
    medium: 2,
    low: 1,
  }

  let weightedSum = 0
  let totalWeight = 0
  const values: number[] = []

  for (const model of validModels) {
    const w = weights[model.confidence]
    weightedSum += model.fairValue! * w
    totalWeight += w
    values.push(model.fairValue!)
  }

  const mid = parseFloat((weightedSum / totalWeight).toFixed(2))
  const sorted = values.sort((a, b) => a - b)
  const low = parseFloat(sorted[0].toFixed(2))
  const high = parseFloat(sorted[sorted.length - 1].toFixed(2))

  return { low, mid, high }
}
