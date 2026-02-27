import bcrypt from 'bcryptjs'
import { getPrismaClient } from '../utils/prisma'
import jwt from 'jsonwebtoken';


//import pkg from '@prisma/client';
// const { PrismaClient } = pkg;

// let prisma;

// export const getPrismaClient = () => {
//   if (!prisma) {
//     prisma = new PrismaClient();
//   }
//   return prisma;
// };

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const prisma = getPrismaClient()

  const email = body.email?.trim()
const password = body.password

if (!email || !password) {
  throw createError({
    statusCode: 400,
    message: "Email and password are required."
  })
}

// Simple email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

if (!emailRegex.test(email)) {
  throw createError({
    statusCode: 400,
    message: "Invalid email format."
  })
}

// Password: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
// const passwordRegex =
//   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?/{}~]).{8,}$/

if (password.length<=6) {
  throw createError({
    statusCode: 400,  
    message:
      "Password must be 6+ characters character."
  })
}


  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(body.password, salt)

  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: passwordHash,
        salt: salt,
      },
    })

    // jwt token code 
    var token = jwt.sign({ id: user.id }, process.env.JWT_KEY);

    console.log("Token:", token)

    // Set the cookie securely here too!
    setCookie(event, 'NoteApp', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })
    // console.log(token)

    return {
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email
      }
     }

  } catch (error) {

    // Handle duplicate email error
    if (error.code === "P2002") {
      throw createError({
        statusCode: 409,
        message: "This email is already registered."
      })
    }

    // Fallback for unexpected errors
    console.error("Registration error:", error)

    throw createError({
      statusCode: 500,
      message: "Something went wrong during registration."
    })
  }
})
