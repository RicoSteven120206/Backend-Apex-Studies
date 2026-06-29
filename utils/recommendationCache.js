"use strict";
const mlService = require("../services/mlService");
const hydrateContents = require("../utils/hydrateContent");
const Recommendation = require("../models/mongoModel/recommendation");

/**
 * @param {number} userId
 * @param {Array} hydrated  
 */
async function cacheRecommendation(userId, hydrated = []) {
  const items = hydrated.map((c) => ({
    contentId: Number(c.id),
    title: c.title,
    score: typeof c.score === "number" ? c.score : 0,
  }));

  return Recommendation.findOneAndUpdate(
    { userId },
    { userId, generatedAt: new Date(), items },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function getCachedRecommendation(userId) {
  return Recommendation.findOne({ userId }).lean();
}

module.exports = { cacheRecommendation, getCachedRecommendation };