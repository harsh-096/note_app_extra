import { getPrismaClient } from '../../utils/prisma'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, 'NoteApp')
    if (!token) throw createError({ statusCode: 401, message: "Unauthorized" })

    const decoded = jwt.verify(token, process.env.JWT_KEY)
    const userId = decoded.id
    const noteId = parseInt(event.context.params.id)
    const body = await readBody(event)
    const { title, content } = body

    console.log('[UPDATE] Saving note ID:', noteId, 'User:', userId)
    console.log('[UPDATE] Title:', title)
    console.log('[UPDATE] Content length:', content?.length)

    if (!title || content === undefined || content === null) {
      throw createError({ statusCode: 400, message: "Title and content required" })
    }

    const prisma = getPrismaClient()

    // Get current note
    const currentNote = await prisma.note.findFirst({
      where: { id: noteId, userId }
    })

    if (!currentNote) {
      throw createError({ statusCode: 404, message: "Note not found" })
    }

    // Check if content changed
    const hasChanges = (currentNote.title !== title) || (currentNote.content !== content)
    console.log('[UPDATE] Has changes:', hasChanges)

    // The default template content
    const defaultContent = "# Untitled Note\n\nStart typing your ideas here..."

    // Save to history if content changed, UNLESS:
    // - This is the first save AND current content is still the default template
    if (hasChanges) {
      const isFirstSaveWithDefault = 
        currentNote.content === defaultContent && 
        currentNote.title === "Untitled Note"
      
      console.log('[UPDATE] Is first save with default template:', isFirstSaveWithDefault)

      if (!isFirstSaveWithDefault) {
        console.log('[UPDATE] Saving old version to history')
        await prisma.note_history.create({
          data: {
            noteId,
            title: currentNote.title,
            content: currentNote.content,
            savedAt: new Date()
          }
        })
        console.log('[UPDATE] History saved successfully')
      } else {
        console.log('[UPDATE] Skipping history for first save with default template')
      }
    } else {
      console.log('[UPDATE] No changes, skipping history')
    }

    // Update note
    const updated = await prisma.note.update({
      where: { id: noteId },
      data: {
        title,
        content,
        updatedAt: new Date()
      }
    })

    console.log('[UPDATE] Note updated successfully')
    return { success: true, note: updated }
  } catch (error) {
    console.error("[UPDATE] Error:", error)
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: "Update failed" })
  }
})