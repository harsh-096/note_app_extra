import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

let prisma

export function getPrismaClient() {
  if (prisma) return prisma

  const connectionString = process.env.DATABASE_URL 
  if (!connectionString) throw new Error('DATABASE_URL is missing')

  // Create the pool with specific settings for Supabase + Vercel
  const pool = new pg.Pool({ 
    connectionString,
    max: 5, // Increased from 1 to allow multiple connections
    ssl: {
      rejectUnauthorized: false // This allows the connection to bypass certificate validation
    }
  })

  // In Prisma 7, you can pass the pool directly to the adapter constructor
  const adapter = new PrismaPg(pool)
  prisma = new PrismaClient({ adapter })

  return prisma
}