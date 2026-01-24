import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getStockQuote } from '@/lib/alpha-vantage'
import { z } from 'zod'

const addStockSchema = z.object({
  symbol: z.string().min(1).max(20),
  shares: z.number().min(0).optional().default(0),
  avgPrice: z.number().min(0).optional(),
  action: z.enum(['watch', 'buy']).optional().default('watch'),
})

const MAX_STOCKS = 10

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = addStockSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { symbol, shares, avgPrice, action } = parsed.data
    const upperSymbol = symbol.toUpperCase()

    // Get user's portfolio
    const portfolio = await prisma.portfolio.findFirst({
      where: { userId: session.user.id },
      include: { stocks: true },
    })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Check stock limit
    if (portfolio.stocks.length >= MAX_STOCKS) {
      return NextResponse.json(
        { error: `Maximum of ${MAX_STOCKS} stocks allowed` },
        { status: 400 }
      )
    }

    // Check if stock already exists
    const existingStock = portfolio.stocks.find(
      (s: { symbol: string }) => s.symbol.toUpperCase() === upperSymbol
    )

    if (existingStock) {
      return NextResponse.json(
        { error: 'Stock already in portfolio' },
        { status: 409 }
      )
    }

    // Get current stock quote
    const quote = await getStockQuote(upperSymbol)
    const currentPrice = quote?.price || avgPrice || 0
    const stockName = quote?.name || upperSymbol
    const exchange = quote?.exchange || (upperSymbol.includes(':') ? upperSymbol.split(':')[0] : 'US')

    let finalShares = shares
    let finalAvgPrice = avgPrice || currentPrice
    let updatedCash = portfolio.currentCash

    // If buying, check if user has enough funds
    if (action === 'buy' && shares > 0 && currentPrice > 0) {
      const totalCost = shares * currentPrice
      if (totalCost > portfolio.currentCash) {
        return NextResponse.json(
          { error: 'Insufficient funds', available: portfolio.currentCash },
          { status: 400 }
        )
      }
      updatedCash = portfolio.currentCash - totalCost
      finalAvgPrice = currentPrice

      // Record transaction
      await prisma.transaction.create({
        data: {
          type: 'buy',
          symbol: upperSymbol,
          shares,
          price: currentPrice,
          total: totalCost,
          portfolioId: portfolio.id,
        },
      })
    }

    // Add stock to portfolio
    const stock = await prisma.portfolioStock.create({
      data: {
        symbol: upperSymbol,
        name: stockName,
        exchange,
        shares: finalShares,
        avgPrice: finalAvgPrice,
        portfolioId: portfolio.id,
      },
    })

    // Update portfolio cash if buying
    if (action === 'buy' && shares > 0) {
      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: { currentCash: updatedCash },
      })
    }

    return NextResponse.json({
      stock,
      currentCash: updatedCash,
      message: action === 'buy' ? 'Stock purchased and added' : 'Stock added to watchlist',
    })
  } catch (error) {
    console.error('Add stock error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
