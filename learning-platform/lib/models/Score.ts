import mongoose from "mongoose"

const ScoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    maxScore: {
      type: Number,
      required: true,
      min: 1,
    },
    percentage: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["quiz", "exam", "assignment", "practice"],
      default: "quiz",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    description: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Calculate percentage before saving
ScoreSchema.pre("save", function (next) {
  this.percentage = Math.round((this.score / this.maxScore) * 100)
  next()
})

export default mongoose.models.Score || mongoose.model("Score", ScoreSchema)
