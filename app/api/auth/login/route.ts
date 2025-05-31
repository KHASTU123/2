import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/lib/models/User"
import { verifyPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("Login API called")

    // Connect to database
    await dbConnect()
    console.log("Database connected")

    const body = await request.json()
    console.log("Login attempt for email:", body.email)

    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ message: "Vui lòng điền đầy đủ thông tin" }, { status: 400 })
    }

    // Find user
    console.log("Finding user...")
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json({ message: "Email hoặc mật khẩu không đúng" }, { status: 401 })
    }

    // Verify password
    console.log("Verifying password...")
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json({ message: "Email hoặc mật khẩu không đúng" }, { status: 401 })
    }

    // Generate token
    console.log("Generating token...")
    const token = generateToken(user._id.toString())

    // Set cookie
    const response = NextResponse.json(
      {
        message: "Đăng nhập thành công",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 },
    )

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    console.log("Login successful for user:", user._id)
    return response
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        message: "Lỗi server. Vui lòng thử lại sau.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
