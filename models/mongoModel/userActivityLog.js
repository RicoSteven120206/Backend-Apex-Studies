const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    content_id: { type: Number, required: true },
    action: {
      type: String,
      enum: ["view", "like", "bookmark", "complete", "quiz"],
      required: true,
    },
    duration_seconds: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userActivityLogSchema = new mongoose.Schema(
  {
    user_id: { type: Number, required: true, unique: true },
    activities: [activitySchema],
  },
  { collection: "user_activity_logs" }
);

module.exports = mongoose.model("UserActivityLog", userActivityLogSchema);
