import mongoose from "mongoose"

const ResponseSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  answer: mongoose.Schema.Types.Mixed,
  timeSpent: { type: Number, default: 0 }, // seconds
  confidence: { type: Number, min: 1, max: 5 },
})

const SurveyResponseSchema = new mongoose.Schema(
  {
    surveyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Survey",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    responses: [ResponseSchema],
    completionTime: { type: Number, required: true }, // seconds
    isCompleted: { type: Boolean, default: false },
    score: Number,
    aiAnalysis: {
      insights: String,
      recommendations: [String],
      personalityTraits: [String],
      learningStyle: String,
      confidenceScore: { type: Number, min: 0, max: 1 },
      generatedAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true },
)

export default mongoose.models.SurveyResponse || mongoose.model("SurveyResponse", SurveyResponseSchema)
