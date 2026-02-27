import bcrypt from 'bcryptjs'
import { getPrismaClient } from '../utils/prisma'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const prisma = getPrismaClient()

  const email = body.email?.trim()
  const password = body.password

  // 1. Basic Validation
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: "Email and password are required."
    })
  }

  try {
    // 2. Find the user in the database by their email
    const user = await prisma.user.findUnique({
      where: { email: email }
    })

    // If the user doesn't exist, throw a 404 Not Found
    if (!user) {
      throw createError({
        statusCode: 404,
        message: "No account found with this email." 
      })
    }

    // 3. Verify the password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password)

    // If password is wrong, throw a 401 Unauthorized
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        message: "Incorrect password. Please try again."
      })
    }

    // 4. Generate the JWT token (just like in your registration file)
    const token = jwt.sign({ id: user.id }, process.env.JWT_KEY, {
      expiresIn: '7d' // Good practice: make the token expire in 7 days
    })

    console.log("Login Token generated:", token)

    // 5. Set the cookie securely
    setCookie(event, 'NoteApp', token, {
      httpOnly: true, // Recommended: Prevents malicious JS from stealing the cookie
      secure: process.env.NODE_ENV === 'production', // Only sent over HTTPS in production
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: '/'
    })

    // 6. Return success response to the frontend
    return {
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email
      }
    }

  } catch (error) {
    // If the error is our custom 401/400 error, pass it through
    if (error.statusCode) {
      throw error
    }

    // Fallback for unexpected database/server errors
    console.error("Login error:", error)
    throw createError({
      statusCode: 500,
      message: "Something went wrong during login."
    })
  }
})