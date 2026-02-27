import { getPrismaClient } from '../../utils/prisma'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'NoteApp')
  if (!token) throw createError({ statusCode: 401, message: "Unauthorized" })

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY)
    const userId = decoded.id

    const prisma = getPrismaClient()

    // Fetch all notes belonging to this specific user, sorted by newest first
    const notes = await prisma.note.findMany({
      where: { 
        userId: userId 
      },
      orderBy: { 
        updatedAt: 'desc' 
      },
      select: { 
        id: true, 
        title: true, 
        updatedAt: true 
      } 
    })

    return { 
      success: true, 
      notes 
    }
  } catch (error) {
    console.error("Failed to fetch notes:", error)
    throw createError({ statusCode: 500, message: "Could not fetch notes" })
  }
})