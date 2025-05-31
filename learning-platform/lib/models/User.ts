import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // giữ unique ở đây để tránh trùng email
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    avatar: {
      type: String,
      default: "/placeholder.svg?height=100&width=100",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    learningProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    // Thông tin cá nhân mở rộng
    dateOfBirth: {
      type: Date,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    school: {
      type: String,
      required: false,
    },
    grade: {
      type: String,
      required: false,
    },
    parentPhone: {
      type: String,
      required: false,
    },

    // Nguyện vọng và mục tiêu
    universityAspirations: [
      {
        university: String,
        major: String,
        priority: Number,
        requiredScore: Number,
        notes: String,
      },
    ],

    // Điểm thi chuẩn hóa
    standardizedTests: {
      vsat: {
        math: Number,
        reading: Number,
        writing: Number,
        total: Number,
        date: Date,
      },
      ielts: {
        listening: Number,
        reading: Number,
        writing: Number,
        speaking: Number,
        overall: Number,
        date: Date,
      },
    },

    // Sở thích và phong cách học tập
    learningPreferences: {
      preferredSubjects: [String],
      learningStyle: {
        type: String,
        enum: ["visual", "auditory", "kinesthetic", "reading"],
        default: "visual",
      },
      studyTime: {
        type: String,
        enum: ["morning", "afternoon", "evening", "night"],
        default: "evening",
      },
      goals: [String],
    },
  },
  {
    timestamps: true,
  }
);

// ĐÃ BỎ đoạn gọi tạo index riêng để tránh duplicate index
// UserSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
