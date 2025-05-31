import mongoose from "mongoose"

const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ["multiple_choice", "single_choice", "rating", "text", "boolean"],
    required: true,
  },
  question: { type: String, required: true },
  options: [String], // For choice questions
  required: { type: Boolean, default: true },
  category: String,
  weight: { type: Number, default: 1 },
})

const SurveySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    type: {
      type: String,
      enum: ["preference", "skill_assessment", "feedback", "personality", "quiz"],
      required: true,
    },
    targetAudience: {
      type: String,
      enum: ["elementary", "middle_school", "high_school", "university", "all"],
      default: "all",
    },
    questions: [QuestionSchema],
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    estimatedTime: { type: Number, default: 10 }, // minutes
    totalResponses: { type: Number, default: 0 },
    analytics: {
      averageCompletionTime: Number,
      completionRate: Number,
      responseDistribution: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true },
)

export default mongoose.models.Survey || mongoose.model("Survey", SurveySchema)
