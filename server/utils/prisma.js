import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

let prismaClient

export function getPrismaClient() {
  if (prismaClient) return prismaClient

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is missing')

  // Using the stable Driver Adapter setup
  const pool = new pg.Pool({ 
    connectionString,
    max: 1, 
    ssl: { rejectUnauthorized: false } 
  })

  const adapter = new PrismaPg(pool)
  prismaClient = new PrismaClient({ adapter })

  return prismaClient
}