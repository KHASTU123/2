import mongoose from "mongoose"

const RecommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["study_method", "university_advice", "score_improvement", "career_guidance"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    tags: [String],
    actionItems: [String],
    estimatedTime: {
      type: String,
      default: "1-2 tuần",
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "dismissed"],
      default: "pending",
    },
    completedAt: Date,
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Recommendation || mongoose.model("Recommendation", RecommendationSchema)
