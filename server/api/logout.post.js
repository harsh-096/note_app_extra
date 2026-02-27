export default defineEventHandler((event) => {
  // Delete the secure cookie by matching the exact name and path
  deleteCookie(event, 'NoteApp', {
    path: '/',
  })

  return {
    success: true,
    message: "Logged out successfully"
  }
})