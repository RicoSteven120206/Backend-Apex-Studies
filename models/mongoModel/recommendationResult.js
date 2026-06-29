const mongoose = require("mongoose");

const recommendedItemSchema = new mongoose.Schema(
  {
    content_id: { type: Number, required: true },
    score: { type: Number, required: true },
  },
  { _id: false }
);

const recommendationResultSchema = new mongoose.Schema(
  {
    user_id: { type: Number, required: true, unique: true },
    recommended_contents: [recommendedItemSchema],
    strategy: {
      type: String,
      enum: ["rule-based", "content-based", "collaborative", "hybrid"],
      default: "rule-based",
    },
    generated_at: { type: Date, default: Date.now },
  },
  { collection: "recommendation_results" }
);

module.exports = mongoose.model("RecommendationResult", recommendationResultSchema);
