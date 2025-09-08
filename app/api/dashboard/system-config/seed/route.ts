import { NextRequest, NextResponse } from 'next/server'
import  prisma  from '@/lib/prisma'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

export async function POST(_request: NextRequest) {
  try {
    // Check if user has admin privileges (implement your auth logic here)
    // For now, we'll proceed with the seeding
    
    console.log('Starting database seeding...')
    
    // Get the path to the seed script
    const seedScriptPath = path.join(process.cwd(), 'scripts', 'comprehensive-seed-extended.ts')
    
    // Execute the seed script using tsx
    const { stdout, stderr } = await execAsync(
      `npx tsx "${seedScriptPath}"`,
      {
        cwd: process.cwd(),
        env: { ...process.env },
        timeout: 300000 // 5 minutes timeout
      }
    )
    
    console.log('Seed script output:', stdout)
    if (stderr) {
      console.warn('Seed script warnings:', stderr)
    }
    
    // Get updated counts to verify seeding success
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.package.count(),
      prisma.trip.count(),
      prisma.chat.count(),
      prisma.message.count(),
      prisma.transaction.count(),
      prisma.verificationDocument.count()
    ])
    
    const [userCount, packageCount, tripCount, chatCount, messageCount, transactionCount, verificationCount] = counts
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      counts: {
        users: userCount,
        packages: packageCount,
        trips: tripCount,
        chats: chatCount,
        messages: messageCount,
        transactions: transactionCount,
        verifications: verificationCount
      },
      output: stdout
    })
    
  } catch (error) {
    console.error('Seeding error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to seed database',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, {
      status: 500
    })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to seed the database'
  }, {
    status: 405
  })
}
