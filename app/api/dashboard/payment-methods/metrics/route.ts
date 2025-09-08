import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const [
      totalPaymentMethods,
      activePaymentMethods,
      cardMethods,
      bankMethods,
      mobileMethods,
      defaultMethods
    ] = await Promise.all([
      prisma.paymentMethod.count(),
      prisma.paymentMethod.count({ where: { isActive: true } }),
      prisma.paymentMethod.count({ 
        where: { type: { in: ['card', 'credit_card', 'debit_card'] } } 
      }),
      prisma.paymentMethod.count({ 
        where: { type: { in: ['bank_account', 'bank_transfer'] } } 
      }),
      prisma.paymentMethod.count({ 
        where: { type: { in: ['mobile_money', 'mobile_payment'] } } 
      }),
      prisma.paymentMethod.count({ where: { isDefault: true } })
    ])

    return NextResponse.json({
      totalPaymentMethods,
      activePaymentMethods,
      cardMethods,
      bankMethods,
      mobileMethods,
      defaultMethods
    })

  } catch (error) {
    console.error('Error fetching payment method metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment method metrics' },
      { status: 500 }
    )
  }
}
