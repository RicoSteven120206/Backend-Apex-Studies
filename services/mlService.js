"use strict";
const mlClient = require("../config/mlClient");

const mlService = {
  async ruleBased(payload) {
    const { data } = await mlClient.post("/recommendations/rule-based", payload);
    return data;
  },
  async contentBased(payload) {
    const { data } = await mlClient.post("/recommendations/content-based", payload);
    return data;
  },
  async collaborative(payload) {
    const { data } = await mlClient.post("/recommendations/collaborative", payload);
    return data;
  },
  /** Gabungan adaptif keempat algoritma — endpoint baru FastAPI */
  async hybrid(payload) {
    const { data } = await mlClient.post("/recommendations/hybrid", payload);
    return data;
  },
  /** Rekomendasi berdasarkan hasil quiz (adaptive learning) */
  async quizProgress(payload) {
    const { data } = await mlClient.post("/recommendations/quiz-progress", payload);
    return data;
  },
  async train(payload = {}) {
    const { data } = await mlClient.post("/train", payload);
    return data;
  },
};

module.exports = mlService;
