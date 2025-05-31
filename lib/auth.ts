import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

if (!JWT_SECRET || JWT_SECRET === "your-secret-key") {
  console.warn("Warning: Using default JWT secret. Please set JWT_SECRET environment variable.")
}

export async function hashPassword(password: string): Promise<string> {
  try {
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    return hashedPassword
  } catch (error) {
    console.error("Error hashing password:", error)
    throw new Error("Failed to hash password")
  }
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const isValid = await bcrypt.compare(password, hashedPassword)
    return isValid
  } catch (error) {
    console.error("Error verifying password:", error)
    return false
  }
}

export function generateToken(userId: string): string {
  try {
    const token = jwt.sign({ userId }, JWT_SECRET, {
      expiresIn: "7d",
      issuer: "learning-platform",
      audience: "learning-platform-users",
    })
    return token
  } catch (error) {
    console.error("Error generating token:", error)
    throw new Error("Failed to generate token")
  }
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "learning-platform",
      audience: "learning-platform-users",
    }) as { userId: string }
    return decoded
  } catch (error) {
    console.error("Error verifying token:", error)
    return null
  }
}
