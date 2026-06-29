const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema(
  {
    user_id: { type: Number, required: true, unique: true },
    keywords: [{ type: String }],
    last_search: { type: Date, default: Date.now },
  },
  { collection: "search_histories" }
);

module.exports = mongoose.model("SearchHistory", searchHistorySchema);
