import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/lib/models/User"
import { hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Register API called")

    const body = await request.json()
    console.log("📝 Request body received:", { ...body, password: "[HIDDEN]" })

    const { name, email, phone, password } = body

    // Validate required fields
    if (!name || !email || !phone || !password) {
      console.log("❌ Missing required fields")
      return NextResponse.json({ message: "Vui lòng điền đầy đủ thông tin" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("❌ Invalid email format:", email)
      return NextResponse.json({ message: "Email không hợp lệ" }, { status: 400 })
    }

    // Validate password length
    if (password.length < 6) {
      console.log("❌ Password too short")
      return NextResponse.json({ message: "Mật khẩu phải có ít nhất 6 ký tự" }, { status: 400 })
    }

    // Connect to database
    console.log("🔌 Connecting to database...")
    await dbConnect()
    console.log("✅ Database connected successfully")

    // Check if user already exists
    console.log("🔍 Checking if user exists with email:", email)
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      console.log("❌ User already exists with email:", email)
      return NextResponse.json({ message: "Email đã được sử dụng" }, { status: 400 })
    }
    console.log("✅ Email is available")

    // Hash password
    console.log("🔐 Hashing password...")
    const hashedPassword = await hashPassword(password)
    console.log("✅ Password hashed successfully")

    // Create user
    console.log("👤 Creating new user...")
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
    }

    const user = await User.create(userData)
    console.log("✅ User created successfully with ID:", user._id)

    return NextResponse.json(
      {
        message: "Đăng ký thành công",
        userId: user._id,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("💥 Registration error:", error)

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      console.log("❌ Duplicate key error - email already exists")
      return NextResponse.json({ message: "Email đã được sử dụng" }, { status: 400 })
    }

    if (error.name === "ValidationError") {
      console.log("❌ Validation error:", error.message)
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ message: messages.join(", ") }, { status: 400 })
    }

    if (error.name === "MongoNetworkError" || error.name === "MongooseServerSelectionError") {
      console.log("❌ MongoDB connection error")
      return NextResponse.json({ message: "Không thể kết nối đến cơ sở dữ liệu" }, { status: 500 })
    }

    return NextResponse.json(
      {
        message: "Lỗi server. Vui lòng thử lại sau.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
