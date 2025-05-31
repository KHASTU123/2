import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  console.log("GET /api/user/profile được gọi");
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      console.error("Token verify error:", err);
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    if (!decoded?.userId) {
      return NextResponse.json({ message: "Invalid token payload" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  console.log("PUT /api/user/profile được gọi");
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      console.error("Token verify error:", err);
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    if (!decoded?.userId) {
      return NextResponse.json({ message: "Invalid token payload" }, { status: 401 });
    }

    await dbConnect();

    const updateData = await request.json();

    // Remove sensitive fields
    delete updateData.password;
    delete updateData.role;
    delete updateData._id;

    const user = await User.findByIdAndUpdate(decoded.userId, updateData, { new: true, runValidators: true }).select(
      "-password"
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user, message: "Cập nhật thành công" }, { status: 200 });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
