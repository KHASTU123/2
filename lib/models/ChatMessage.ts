import mongoose from "mongoose"

const ChatMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
    context: {
      userScores: [Object],
      userProfile: Object,
      searchResults: [Object],
    },
    type: {
      type: String,
      enum: ["general", "score_analysis", "university_advice", "study_method"],
      default: "general",
    },
    satisfaction: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.ChatMessage || mongoose.model("ChatMessage", ChatMessageSchema)
