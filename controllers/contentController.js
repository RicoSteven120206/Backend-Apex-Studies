"use strict";
const { Op } = require("sequelize");
const {
  Content, Subject, Quiz, UserInteraction,
} = require("../models/mysqlModel");
const UserActivityLog         = require("../models/mongoModel/userActivityLog");
const SearchHistory           = require("../models/mongoModel/searchHistory");
const AnalyticsSubjectPref    = require("../models/mongoModel/analyticsSubjectPreference");
const mlService               = require("../services/mlService");
const hydrateContents         = require("../utils/hydrateContent");
const { cacheRecommendation } = require("../utils/recommendationCache");

async function logActivity(userId, contentId, action, durationSeconds = 0) {
  if (!userId) return;
  try {
    await UserActivityLog.findOneAndUpdate(
      { user_id: userId },
      {
        $push: {
          activities: {
            content_id: contentId,
            action,
            duration_seconds: durationSeconds,
            created_at: new Date(),
          },
        },
      },
      { upsert: true }
    );
  } catch (e) {
    console.error("[ActivityLog]", e.message);
  }
}

async function updateSubjectPreference(userId, subjectId, subjectName, delta = 5) {
  if (!userId) return;
  try {
    const pref = await AnalyticsSubjectPref.findOne({ user_id: userId });
    if (!pref) {
      await AnalyticsSubjectPref.create({
        user_id: userId,
        subjects: [{ subject_id: subjectId, subject_name: subjectName, score: delta }],
      });
      return;
    }
    const idx = pref.subjects.findIndex((s) => s.subject_id === subjectId);
    if (idx >= 0) {
      pref.subjects[idx].score = Math.min(100, pref.subjects[idx].score + delta);
    } else {
      pref.subjects.push({ subject_id: subjectId, subject_name: subjectName, score: delta });
    }
    pref.updated_at = new Date();
    await pref.save();
  } catch (e) {
    console.error("[SubjectPref]", e.message);
  }
}

const contentController = {
  async list(req, res) {
    try {
      const { subject_id, content_type, difficulty, education_level, grade, limit = 20, page = 1 } = req.query;
      const where = {};

      if (subject_id)     where.subject_id     = subject_id;
      if (content_type)   where.content_type   = content_type;
      if (difficulty)     where.difficulty     = difficulty;
      if (education_level) where.education_level = education_level;
      if (grade)          where.grade          = grade;

      if (req.user && req.user.role !== "admin" && !education_level) {
        where.education_level = req.user.education_level;
        where.grade           = req.user.grade;
      }

      const offset = (Number(page) - 1) * Number(limit);
      const { count, rows } = await Content.findAndCountAll({
        where,
        include: [{ model: Subject, as: "subject", attributes: ["id", "name"] }],
        order: [["created_at", "DESC"]],
        limit: Number(limit),
        offset,
      });

      return res.json({
        success: true,
        total: count,
        page: Number(page),
        data: rows,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async detail(req, res) {
    try {
      const content = await Content.findByPk(req.params.id, {
        include: [
          { model: Subject, as: "subject" },
          { model: Quiz, as: "quiz", attributes: ["id", "title", "passing_score"] },
        ],
      });
      if (!content) return res.status(404).json({ success: false, message: "Materi tidak ditemukan" });

      if (req.user) {
        await UserInteraction.create({
          user_id: req.user.id,
          content_id: content.id,
          interaction_type: "view",
        });
        await logActivity(req.user.id, content.id, "view");
        await updateSubjectPreference(req.user.id, content.subject_id, content.subject?.name, 2);
      }

      return res.json({ success: true, data: content });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async search(req, res) {
    try {
      const { q, subject_id, content_type, difficulty } = req.query;
      if (!q) return res.status(400).json({ success: false, message: "Query pencarian wajib diisi" });

      const where = {
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
        ],
      };
      if (subject_id)   where.subject_id   = subject_id;
      if (content_type) where.content_type = content_type;
      if (difficulty)   where.difficulty   = difficulty;
      if (req.user && req.user.role !== "admin") {
        where.education_level = req.user.education_level;
        where.grade           = req.user.grade;
      }

      const data = await Content.findAll({
        where,
        include: [{ model: Subject, as: "subject", attributes: ["id", "name"] }],
        order: [["created_at", "DESC"]],
        limit: 20,
      });

      if (req.user) {
        try {
          await SearchHistory.findOneAndUpdate(
            { user_id: req.user.id },
            { $addToSet: { keywords: q }, $set: { last_search: new Date() } },
            { upsert: true }
          );
        } catch (e) { 
          console.error(error.message);
        }
      }

      return res.json({ success: true, total: data.length, data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async markComplete(req, res) {
    try {
      const { duration_seconds = 0 } = req.body;
      const content = await Content.findByPk(req.params.id, {
        include: [{ model: Subject, as: "subject", attributes: ["id", "name"] }],
      });
      if (!content) return res.status(404).json({ success: false, message: "Materi tidak ditemukan" });

      await UserInteraction.create({
        user_id: req.user.id,
        content_id: content.id,
        interaction_type: "complete",
      });
      await logActivity(req.user.id, content.id, "complete", duration_seconds);
      await updateSubjectPreference(req.user.id, content.subject_id, content.subject?.name, 10);

      mlService.contentBased({
        content_id: Number(content.id),
        user_id:    Number(req.user.id),
        interaction_type: "complete",
        subject_id: content.subject_id,
        education_level: content.education_level,
        grade: content.grade,
        limit: 10,
      }).then(async (mlResult) => {
        const data = await hydrateContents(mlResult.recommendations);
        if (data.length) await cacheRecommendation(req.user.id, data);
      }).catch(() => {});

      return res.json({ success: true, message: "Materi ditandai selesai" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async toggleInteraction(req, res) {
    try {
      const { type } = req.body;
      if (!["like", "bookmark"].includes(type)) {
        return res.status(400).json({ success: false, message: "type harus like atau bookmark" });
      }
      const contentId = req.params.id;
      const existing = await UserInteraction.findOne({
        where: { user_id: req.user.id, content_id: contentId, interaction_type: type },
      });

      if (existing) {
        await existing.destroy();
        return res.json({ success: true, action: "removed", type });
      }
      await UserInteraction.create({
        user_id: req.user.id, content_id: contentId, interaction_type: type,
      });
      return res.json({ success: true, action: "added", type });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async adminList(req, res) {
    try {
      const { subject_id, content_type, education_level, grade, difficulty } = req.query;
      const where = {};
      if (subject_id)      where.subject_id      = subject_id;
      if (content_type)    where.content_type    = content_type;
      if (education_level) where.education_level = education_level;
      if (grade)           where.grade           = grade;
      if (difficulty)      where.difficulty      = difficulty;

      const data = await Content.findAll({
        where,
        include: [
          { model: Subject, as: "subject", attributes: ["id", "name"] },
          { model: Quiz, as: "quiz", attributes: ["id", "title"] },
        ],
        order: [["id", "DESC"]],
      });
      return res.json({ success: true, total: data.length, data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async create(req, res) {
    try {
      const {
        subject_id, title, description, content_type,
        thumbnail_url, content_url, education_level, grade,
        difficulty, estimated_minutes,
      } = req.body;

      if (!subject_id || !title || !content_type || !education_level || grade == null || !difficulty) {
        return res.status(400).json({ success: false, message: "Field wajib tidak lengkap" });
      }

      const subject = await Subject.findByPk(subject_id);
      if (!subject) return res.status(400).json({ success: false, message: "subject_id tidak valid" });

      const content = await Content.create({
        subject_id, title, description, content_type,
        thumbnail_url, content_url, education_level,
        grade: Number(grade), difficulty, estimated_minutes,
        created_by: req.user.email,
      });

      return res.status(201).json({ success: true, data: content });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async update(req, res) {
    try {
      const content = await Content.findByPk(req.params.id);
      if (!content) return res.status(404).json({ success: false, message: "Tidak ditemukan" });

      const allowed = [
        "subject_id", "title", "description", "content_type",
        "thumbnail_url", "content_url", "education_level", "grade",
        "difficulty", "estimated_minutes",
      ];
      const payload = {};
      for (const k of allowed) if (req.body[k] !== undefined) payload[k] = req.body[k];
      payload.updated_by = req.user.email;

      await content.update(payload);
      return res.json({ success: true, data: content });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async remove(req, res) {
    try {
      const content = await Content.findByPk(req.params.id);
      if (!content) return res.status(404).json({ success: false, message: "Tidak ditemukan" });
      await content.destroy();
      return res.json({ success: true, message: "Materi dihapus" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async retrainModel(req, res) {
    try {
      const result = await mlService.train(req.body || {});
      return res.json({ success: true, message: "Retrain dimulai", data: result });
    } catch (err) {
      console.error(err);
      return res.status(502).json({ success: false, message: "Gagal memanggil ML service" });
    }
  },
};

module.exports = contentController;
