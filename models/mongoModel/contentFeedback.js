const mongoose = require("mongoose");

const contentFeedbackSchema = new mongoose.Schema(
  {
    user_id: { type: Number, required: true },
    content_id: { type: Number, required: true },
    feedback_type: {
      type: String,
      enum: ["video", "article", "pdf", "quiz"],
      required: true,
    },
    feedback_data: { type: mongoose.Schema.Types.Mixed },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "content_feedback" }
);

module.exports = mongoose.model("ContentFeedback", contentFeedbackSchema);
