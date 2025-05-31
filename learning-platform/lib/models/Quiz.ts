import mongoose from "mongoose"

const QuizQuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  type: {
    type: String,
    enum: ["multiple_choice", "true_false", "fill_blank", "matching"],
    required: true,
  },
  options: [String],
  correctAnswer: mongoose.Schema.Types.Mixed,
  explanation: String,
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
  category: String,
  points: { type: Number, default: 1 },
  timeLimit: Number, // seconds
})

const QuizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    subject: { type: String, required: true },
    category: String,
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    questions: [QuizQuestionSchema],
    timeLimit: Number, // total time in minutes
    passingScore: { type: Number, default: 70 },
    maxAttempts: { type: Number, default: 3 },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    analytics: {
      totalAttempts: { type: Number, default: 0 },
      averageScore: Number,
      averageTime: Number,
      passRate: Number,
    },
  },
  { timestamps: true },
)

export default mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema)
