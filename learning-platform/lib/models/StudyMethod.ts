import mongoose from "mongoose";

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
    targetAudience: {
      type: String,
    },
    learningStyle: {
      type: String,
    },
    methods: [
      {
        name: String,
        description: String,
        difficulty: String,
        timeRequired: String,
        effectiveness: Number,
        personalizedTips: [String],
        resources: [String],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.StudyMethod || mongoose.model("StudyMethod", StudyMethodSchema);
