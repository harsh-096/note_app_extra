import { getPrismaClient } from '../../utils/prisma'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  // 1. Verify user is logged in
  const token = getCookie(event, 'NoteApp')
  if (!token) throw createError({ statusCode: 401, message: "Unauthorized" })

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY)
    const userId = decoded.id
    const noteId = parseInt(event.context.params.id)

    const prisma = getPrismaClient()

    // 2. Delete the note from the database safely
    const result = await prisma.note.deleteMany({
      where: { 
        id: noteId,
        userId: userId // Crucial: prevents users from deleting someone else's note
      }
    })

    if (result.count === 0) {
      throw createError({ statusCode: 404, message: "Note not found or unauthorized" })
    }

    return { success: true, message: "Note deleted successfully" }
    
  } catch (error) {
    console.error("Failed to delete note:", error)
    throw createError({ statusCode: 500, message: "Could not delete note" })
  }
})