import { getPrismaClient } from '../../utils/prisma'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  // 1. Get the secure cookie to find out WHO is clicking the "+" button
  const token = getCookie(event, 'NoteApp')
  if (!token) throw createError({ statusCode: 401, message: "Unauthorized" })

  try {
    // 2. Decode the token to get the user's ID
    const decoded = jwt.verify(token, process.env.JWT_KEY)
    const userId = decoded.id

    const prisma = getPrismaClient()

    // 3. Create a brand new blank note in the database
    const newNote = await prisma.note.create({
      data: {
        title: "Untitled Note",
        content: "# Untitled Note\n\nStart typing your ideas here...",
        userId: userId // Crucial: This links the note to the specific user!
      }
    })

    return { 
      success: true, 
      note: newNote 
    }
  } catch (error) {
    console.error("Failed to create note:", error)
    throw createError({ statusCode: 500, message: "Could not create note" })
  }
})