import mongoose from "mongoose"

const DataAnalyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    period: {
      type: String,
      enum: ["daily", "weekly", "monthly", "semester", "yearly"],
      required: true,
    },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },

    // Raw Data Metrics
    rawMetrics: {
      totalScores: Number,
      totalSurveys: Number,
      totalQuizzes: Number,
      totalStudyTime: Number, // minutes
      activeDays: Number,
    },

    // Performance Analytics
    performance: {
      averageScore: Number,
      scoreImprovement: Number,
      consistencyScore: Number, // 0-100
      learningVelocity: Number, // scores per week
      engagementLevel: Number, // 0-100
    },

    // Learning Patterns
    patterns: {
      preferredStudyTime: String, // morning, afternoon, evening, night
      optimalSessionLength: Number, // minutes
      difficultyPreference: String, // easy, medium, hard
      subjectStrengths: [String],
      subjectWeaknesses: [String],
      learningStyle: String, // visual, auditory, kinesthetic, reading
    },

    // AI Deep Analysis
    aiAnalysis: {
      deepInsights: String, // 300-500 words analysis
      personalizedRecommendations: [String],
      actionPlan: {
        shortTerm: [String], // 1-2 weeks
        mediumTerm: [String], // 1-3 months
        longTerm: [String], // 3+ months
      },
      riskFactors: [String],
      successPredictions: {
        nextExamScore: Number,
        semesterGoalAchievement: Number, // probability 0-1
        universityReadiness: Number, // 0-100
      },
      confidenceScore: { type: Number, min: 0, max: 1 },
      generatedAt: { type: Date, default: Date.now },
    },

    // Comparative Analytics
    comparative: {
      peerRanking: Number, // percentile
      gradeAverage: Number,
      nationalAverage: Number,
      improvementRate: Number, // compared to peers
    },
  },
  { timestamps: true },
)

// Ensure one analytics record per user per period
DataAnalyticsSchema.index({ userId: 1, period: 1, periodStart: 1 }, { unique: true })

export default mongoose.models.DataAnalytics || mongoose.model("DataAnalytics", DataAnalyticsSchema)
