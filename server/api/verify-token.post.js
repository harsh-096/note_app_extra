import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  // 1. Read the cookie directly from the server headers, not the body!
  const token = getCookie(event, 'NoteApp')

  // If there is no token attached to the request, they aren't logged in
  if (!token) {
    return { valid: false }
  }

  try {
    // 2. Verify the token
    jwt.verify(token, process.env.JWT_KEY)
    return { valid: true }
  } catch (error) {
    console.error('Verify token error:', error.message)
    return { valid: false }
  }
})