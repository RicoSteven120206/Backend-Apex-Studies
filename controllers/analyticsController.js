"use strict";
const { UserInteraction, Content, User, UserQuizAttempt } = require("../models/mysqlModel");
const { Op, fn, col, literal }  = require("sequelize");
const UserActivityLog            = require("../models/mongoModel/userActivityLog");
const SearchHistory              = require("../models/mongoModel/searchHistory");
const ContentFeedback            = require("../models/mongoModel/contentFeedback");
const AnalyticsSubjectPref       = require("../models/mongoModel/analyticsSubjectPreference");
const RecommendationResult       = require("../models/mongoModel/recommendationResult");

const analyticsController = {
  async myActivityLog(req, res) {
    try {
      const log = await UserActivityLog.findOne({ user_id: Number(req.user.id) }).lean();
      return res.json({ success: true, data: log?.activities || [] });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async getSearchHistory(req, res) {
    try {
      const history = await SearchHistory.findOne({ user_id: Number(req.user.id) }).lean();
      return res.json({ success: true, data: history || { keywords: [], last_search: null } });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async clearSearchHistory(req, res) {
    try {
      await SearchHistory.findOneAndUpdate(
        { user_id: Number(req.user.id) },
        { $set: { keywords: [], last_search: null } }
      );
      return res.json({ success: true, message: "Riwayat pencarian dihapus" });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async getSubjectPreference(req, res) {
    try {
      const pref = await AnalyticsSubjectPref.findOne({ user_id: Number(req.user.id) }).lean();
      return res.json({ success: true, data: pref?.subjects || [] });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async saveFeedback(req, res) {
    try {
      const { content_id, feedback_type, feedback_data } = req.body;
      if (!content_id || !feedback_type) {
        return res.status(400).json({ success: false, message: "content_id dan feedback_type wajib" });
      }
      const fb = await ContentFeedback.create({
        user_id: Number(req.user.id),
        content_id: Number(content_id),
        feedback_type,
        feedback_data: feedback_data || {},
      });
      return res.status(201).json({ success: true, data: fb });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async myRecommendations(req, res) {
    try {
      const rec = await RecommendationResult.findOne({ user_id: Number(req.user.id) }).lean();
      if (!rec) return res.json({ success: true, data: [], message: "Belum ada rekomendasi" });
      return res.json({ success: true, generated_at: rec.generated_at, data: rec.recommended_contents });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async systemStats(req, res) {
    try {
      const [totalUsers, totalContents, totalInteractions, totalAttempts] = await Promise.all([
        User.count(),
        Content.count(),
        UserInteraction.count(),
        UserQuizAttempt.count(),
      ]);

      const passCount = await UserQuizAttempt.count({ where: { status: "pass" } });

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentByType = await UserInteraction.findAll({
        where: { created_at: { [Op.gte]: sevenDaysAgo } },
        attributes: ["interaction_type", [fn("COUNT", col("id")), "count"]],
        group: ["interaction_type"],
        raw: true,
      });

      return res.json({
        success: true,
        data: {
          total_users: totalUsers,
          total_contents: totalContents,
          total_interactions: totalInteractions,
          total_quiz_attempts: totalAttempts,
          quiz_pass_rate: totalAttempts ? Math.round((passCount / totalAttempts) * 100) : 0,
          recent_interactions_by_type: recentByType,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async popularContent(req, res) {
    try {
      const { limit = 10, type } = req.query;
      const where = {};
      if (type) where.interaction_type = type;

      const popular = await UserInteraction.findAll({
        where,
        attributes: ["content_id", [fn("COUNT", col("UserInteraction.id")), "interaction_count"]],
        group: ["content_id"],
        order: [[literal("interaction_count"), "DESC"]],
        limit: Number(limit),
        include: [{ model: Content, as: "content", attributes: ["id", "title", "content_type", "difficulty"] }],
        raw: false,
      });
      return res.json({ success: true, data: popular });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async getUserActivity(req, res) {
    try {
      const userId = Number(req.params.userId);
      const [mysqlInteractions, mongoLog, mongoPref] = await Promise.all([
        UserInteraction.findAll({
          where: { user_id: userId },
          include: [{ model: Content, as: "content", attributes: ["id", "title"] }],
          order: [["created_at", "DESC"]],
          limit: 50,
        }),
        UserActivityLog.findOne({ user_id: userId }).lean(),
        AnalyticsSubjectPref.findOne({ user_id: userId }).lean(),
      ]);

      return res.json({
        success: true,
        data: {
          interactions:        mysqlInteractions,
          activity_log:        mongoLog?.activities || [],
          subject_preferences: mongoPref?.subjects || [],
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },
};

module.exports = analyticsController;
