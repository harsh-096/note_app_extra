import { getPrismaClient } from '../../../utils/prisma'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    const noteId = parseInt(event.context.params.id)
    console.log('[HISTORY] Fetching history for noteId:', noteId)
    
    const token = getCookie(event, 'NoteApp')
    if (!token) throw createError({ statusCode: 401, message: "Unauthorized" })

    const decoded = jwt.verify(token, process.env.JWT_KEY)
    const userId = decoded.id
    console.log('[HISTORY] User ID:', userId)

    const prisma = getPrismaClient()

    // Verify note exists and belongs to user
    const note = await prisma.note.findFirst({
      where: { id: noteId, userId }
    })

    if (!note) {
      console.log('[HISTORY] Note not found or not owned by user')
      throw createError({ statusCode: 404, message: "Note not found" })
    }

    console.log('[HISTORY] Note found:', note.title)

    // Get all old versions (oldest first)
    const oldVersions = await prisma.note_history.findMany({
      where: { noteId },
      orderBy: { savedAt: 'asc' }
    })

    console.log('[HISTORY] Found', oldVersions.length, 'old versions')

    // Build version array: [v1, v2, v3, ..., Latest]
    const versions = [
      // Add all old versions
      ...oldVersions.map((v, idx) => ({
        id: v.id,
        isLatest: false,
        versionNum: idx + 1,
        title: v.title,
        content: v.content,
        savedAt: v.savedAt
      })),
      // Add current version as latest
      {
        id: 'current',
        isLatest: true,
        versionNum: oldVersions.length + 1,
        title: note.title,
        content: note.content,
        savedAt: note.updatedAt
      }
    ]

    console.log('[HISTORY] Returning versions:', versions.length)

    return { success: true, history: versions }
  } catch (error) {
    console.error("[HISTORY] Error:", error)
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: "Fetch failed" })
  }
})