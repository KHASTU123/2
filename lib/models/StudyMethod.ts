import mongoose from "mongoose"

const StudyMethodSchema = new mongoose.Schema(
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
    methods: [
      {
        name: String,
        description: String,
        difficulty: {
          type: String,
          enum: ["beginner", "intermediate", "advanced"],
          default: "beginner",
        },
        timeRequired: String,
        effectiveness: Number,
        personalizedTips: [String],
        resources: [String],
      },
    ],
    targetAudience: {
      type: String,
      enum: ["elementary", "middle_school", "high_school", "university"],
      required: true,
    },
    learningStyle: {
      type: String,
      enum: ["visual", "auditory", "kinesthetic", "reading"],
      required: true,
    },
    generatedBy: {
      type: String,
      default: "AI",
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.StudyMethod || mongoose.model("StudyMethod", StudyMethodSchema)
