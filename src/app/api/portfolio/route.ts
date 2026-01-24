import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const portfolios = await prisma.portfolio.findMany({
      where: { userId: session.user.id },
      include: {
        stocks: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    // If no portfolio exists, create one
    if (portfolios.length === 0) {
      const newPortfolio = await prisma.portfolio.create({
        data: {
          name: 'My Portfolio',
          userId: session.user.id,
          initialFunds: 10000,
          currentCash: 10000,
        },
        include: {
          stocks: true,
          transactions: true,
        },
      })
      return NextResponse.json({ portfolios: [newPortfolio] })
    }

    return NextResponse.json({ portfolios })
  } catch (error) {
    console.error('Portfolio fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

const updatePortfolioSchema = z.object({
  name: z.string().min(1).optional(),
  initialFunds: z.number().min(0).optional(),
})

export async function PATCH(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = updatePortfolioSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const portfolio = await prisma.portfolio.findFirst({
      where: { userId: session.user.id },
    })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    const updateData: { name?: string; initialFunds?: number; currentCash?: number } = {}

    if (parsed.data.name) {
      updateData.name = parsed.data.name
    }

    if (parsed.data.initialFunds !== undefined) {
      const fundsDiff = parsed.data.initialFunds - portfolio.initialFunds
      updateData.initialFunds = parsed.data.initialFunds
      updateData.currentCash = portfolio.currentCash + fundsDiff
    }

    const updated = await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: updateData,
      include: { stocks: true },
    })

    return NextResponse.json({ portfolio: updated })
  } catch (error) {
    console.error('Portfolio update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
