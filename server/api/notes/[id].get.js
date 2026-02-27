import { getPrismaClient } from '../../utils/prisma'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'NoteApp')
  if (!token) throw createError({ statusCode: 401, message: "Unauthorized" })

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY)
    const userId = decoded.id
    const noteId = parseInt(event.context.params.id)

    const prisma = getPrismaClient()

    // Fetch the single note from the database
    const note = await prisma.note.findUnique({
      where: { 
        id: noteId,
        userId: userId
      }
    })

    if (!note) {
      throw createError({ statusCode: 404, message: "Note not found" })
    }

    return { 
      success: true, 
      note 
    }
  } catch (error) {
    console.error("Failed to load note:", error)
    throw createError({ statusCode: 500, message: "Could not load note" })
  }
})