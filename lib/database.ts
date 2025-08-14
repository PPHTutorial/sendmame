

import prisma from "./prisma"

// Helper function to handle Prisma connection
export async function connectToDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Connected to database successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to connect to database:', error)
    return false
  }
}

// Helper function to disconnect from database
export async function disconnectFromDatabase() {
  try {
    await prisma.$disconnect()
    console.log('✅ Disconnected from database successfully')
  } catch (error) {
    console.error('❌ Failed to disconnect from database:', error)
  }
}

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

export default prisma
