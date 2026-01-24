import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getStockQuote } from '@/lib/alpha-vantage'
import { z } from 'zod'

const tradeSchema = z.object({
  action: z.enum(['buy', 'sell']),
  shares: z.number().positive(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { symbol } = await params
    const upperSymbol = symbol.toUpperCase()
    const body = await request.json()
    const parsed = tradeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { action, shares } = parsed.data

    // Get portfolio and stock
    const portfolio = await prisma.portfolio.findFirst({
      where: { userId: session.user.id },
      include: { stocks: true },
    })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    const stock = portfolio.stocks.find(
      (s: { symbol: string }) => s.symbol.toUpperCase() === upperSymbol
    )

    if (!stock) {
      return NextResponse.json({ error: 'Stock not in portfolio' }, { status: 404 })
    }

    // Get current price
    const quote = await getStockQuote(upperSymbol)
    const currentPrice = quote?.price || stock.avgPrice

    if (action === 'buy') {
      const totalCost = shares * currentPrice

      if (totalCost > portfolio.currentCash) {
        return NextResponse.json(
          { error: 'Insufficient funds', available: portfolio.currentCash },
          { status: 400 }
        )
      }

      // Calculate new average price
      const totalShares = stock.shares + shares
      const newAvgPrice =
        (stock.shares * stock.avgPrice + shares * currentPrice) / totalShares

      // Update stock and portfolio
      const [updatedStock] = await prisma.$transaction([
        prisma.portfolioStock.update({
          where: { id: stock.id },
          data: {
            shares: totalShares,
            avgPrice: newAvgPrice,
          },
        }),
        prisma.portfolio.update({
          where: { id: portfolio.id },
          data: { currentCash: portfolio.currentCash - totalCost },
        }),
        prisma.transaction.create({
          data: {
            type: 'buy',
            symbol: upperSymbol,
            shares,
            price: currentPrice,
            total: totalCost,
            portfolioId: portfolio.id,
          },
        }),
      ])

      return NextResponse.json({
        stock: updatedStock,
        currentCash: portfolio.currentCash - totalCost,
        message: `Bought ${shares} shares at $${currentPrice.toFixed(2)}`,
      })
    } else {
      // Sell
      if (shares > stock.shares) {
        return NextResponse.json(
          { error: 'Not enough shares', available: stock.shares },
          { status: 400 }
        )
      }

      const totalProceeds = shares * currentPrice
      const newShares = stock.shares - shares

      // Update stock and portfolio
      const [updatedStock] = await prisma.$transaction([
        prisma.portfolioStock.update({
          where: { id: stock.id },
          data: { shares: newShares },
        }),
        prisma.portfolio.update({
          where: { id: portfolio.id },
          data: { currentCash: portfolio.currentCash + totalProceeds },
        }),
        prisma.transaction.create({
          data: {
            type: 'sell',
            symbol: upperSymbol,
            shares,
            price: currentPrice,
            total: totalProceeds,
            portfolioId: portfolio.id,
          },
        }),
      ])

      return NextResponse.json({
        stock: updatedStock,
        currentCash: portfolio.currentCash + totalProceeds,
        message: `Sold ${shares} shares at $${currentPrice.toFixed(2)}`,
      })
    }
  } catch (error) {
    console.error('Trade error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { symbol } = await params
    const upperSymbol = symbol.toUpperCase()

    // Get portfolio
    const portfolio = await prisma.portfolio.findFirst({
      where: { userId: session.user.id },
      include: { stocks: true },
    })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    const stock = portfolio.stocks.find(
      (s: { symbol: string }) => s.symbol.toUpperCase() === upperSymbol
    )

    if (!stock) {
      return NextResponse.json({ error: 'Stock not in portfolio' }, { status: 404 })
    }

    // If stock has shares, sell them first at current price
    if (stock.shares > 0) {
      const quote = await getStockQuote(upperSymbol)
      const currentPrice = quote?.price || stock.avgPrice
      const totalProceeds = stock.shares * currentPrice

      await prisma.$transaction([
        prisma.transaction.create({
          data: {
            type: 'sell',
            symbol: upperSymbol,
            shares: stock.shares,
            price: currentPrice,
            total: totalProceeds,
            portfolioId: portfolio.id,
          },
        }),
        prisma.portfolio.update({
          where: { id: portfolio.id },
          data: { currentCash: portfolio.currentCash + totalProceeds },
        }),
      ])
    }

    // Remove stock from portfolio
    await prisma.portfolioStock.delete({
      where: { id: stock.id },
    })

    return NextResponse.json({
      message: 'Stock removed from portfolio',
    })
  } catch (error) {
    console.error('Remove stock error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
