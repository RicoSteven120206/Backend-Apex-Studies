const mongoose = require("mongoose");

const subjectScoreSchema = new mongoose.Schema(
  {
    subject_id: { type: Number, required: true },
    subject_name: { type: String, required: true },
    score: { type: Number, default: 0 },
  },
  { _id: false }
);

const analyticsSubjectPreferenceSchema = new mongoose.Schema(
  {
    user_id: { type: Number, required: true, unique: true },
    subjects: [subjectScoreSchema],
    updated_at: { type: Date, default: Date.now },
  },
  { collection: "analytics_subject_preference" }
);

module.exports = mongoose.model("AnalyticsSubjectPreference", analyticsSubjectPreferenceSchema);
