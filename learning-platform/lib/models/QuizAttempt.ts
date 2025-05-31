import mongoose from "mongoose"

const AnswerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  userAnswer: mongoose.Schema.Types.Mixed,
  correctAnswer: mongoose.Schema.Types.Mixed,
  isCorrect: { type: Boolean, required: true },
  points: { type: Number, required: true },
  timeSpent: { type: Number, default: 0 }, // seconds
})

const QuizAttemptSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: [AnswerSchema],
    score: { type: Number, required: true },
    percentage: { type: Number, required: true },
    totalTime: { type: Number, required: true }, // seconds
    isPassed: { type: Boolean, required: true },
    attemptNumber: { type: Number, required: true },
    aiAnalysis: {
      strengths: [String],
      weaknesses: [String],
      recommendations: [String],
      nextSteps: [String],
      confidenceScore: { type: Number, min: 0, max: 1 },
      generatedAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true },
)

export default mongoose.models.QuizAttempt || mongoose.model("QuizAttempt", QuizAttemptSchema)
