import { getPrismaClient } from '../../../utils/prisma'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, 'NoteApp')
    if (!token) throw createError({ statusCode: 401, message: "Unauthorized" })

    const decoded = jwt.verify(token, process.env.JWT_KEY)
    const userId = decoded.id
    const versionId = event.context.params.id

    const prisma = getPrismaClient()

    // If requesting 'current', we need the note ID from query param
    if (versionId === 'current') {
      throw createError({ statusCode: 400, message: "Use note endpoint for current version" })
    }

    const id = parseInt(versionId)

    // Get history version
    const version = await prisma.note_history.findUnique({
      where: { id }
    })

    if (!version) {
      throw createError({ statusCode: 404, message: "Version not found" })
    }

    // Verify user owns this note
    const note = await prisma.note.findFirst({
      where: { id: version.noteId, userId }
    })

    if (!note) {
      throw createError({ statusCode: 403, message: "Unauthorized" })
    }

    return {
      success: true,
      id: version.id,
      title: version.title,
      content: version.content,
      savedAt: version.savedAt
    }
  } catch (error) {
    console.error("GET /notes/history/[id] error:", error)
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: "Fetch failed" })
  }
})
