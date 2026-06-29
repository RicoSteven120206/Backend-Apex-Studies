"use strict";

const mlService = require("../services/mlService");
const hydrateContents = require("../utils/hydrateContent");
const { Content, UserInteraction } = require("../models/mysqlModel");
const QuizResult = require("../models/mongoModel/quizResult");
const Recommendation = require("../models/mongoModel/recommendation");

async function cacheResult(userId, items) {
  if (!userId || !items || !items.length) return;
  try {
    await Recommendation.findOneAndUpdate(
      { userId: Number(userId) },
      {
        userId: Number(userId),
        items: items.map((c) => ({
          contentId: Number(c.id || c.content_id),
          title: c.title,
          score: c.score,
        })),
        generatedAt: new Date(),
      },
      { upsert: true, new: true } 
    );
  } catch (error) {
    console.error("[RecCache Error]: Gagal menyimpan cache rekomendasi", error.message);
  }
}

async function getFavoriteSubject(userId) {
  try {
    const pref = await QuizResult.findOne({ userId: Number(userId) }).lean();
    return pref ? pref.favoriteSubject : null;
  } catch (error) {
    return null;
  }
}

function handleMlError(res, err) {
  console.error("[ML ERROR]:", err.message);
  
  if (err.response) {
    return res.status(502).json({
      success: false,
      message: "Layanan Rekomendasi (ML) mengembalikan error",
      detail: err.response.data,
    });
  }
  
  if (["ECONNABORTED", "ECONNREFUSED"].includes(err.code)) {
    return res.status(503).json({
      success: false,
      message: "Layanan ML tidak aktif atau tidak dapat dijangkau",
    });
  }
  
  return res.status(500).json({
    success: false,
    message: "Internal server error pada backend Express",
  });
}

const recommendationController = {
  async questionnaire(req, res) {
    try {
      const { education_level, grade, scores = {}, favorite_subject, difficulty } = req.body;

      if (!education_level || grade == null) {
        return res.status(400).json({
          success: false,
          message: "Parameter 'education_level' dan 'grade' wajib diisi",
        });
      }

      const preferred_content_type = [
        ["video", Number(scores.video || 0)],
        ["text", Number(scores.text || 0)],
        ["image", Number(scores.image || 0)],
      ].sort((a, b) => b[1] - a[1])[0][0];

      if (req.user) {
        if (!favorite_subject || !difficulty) {
          return res.status(400).json({
            success: false,
            message: "Parameter 'favorite_subject' dan 'difficulty' wajib untuk user login",
          });
        }
        
        await QuizResult.findOneAndUpdate(
          { userId: Number(req.user.id) },
          {
            userId: Number(req.user.id),
            favoriteSubject: favorite_subject,
            favoriteContent: preferred_content_type,
            difficulty: difficulty,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }

      const mlResult = await mlService.ruleBased({
        education_level,
        grade: Number(grade),
        scores,
        preferred_content_type,
        favorite_subject: favorite_subject || null,
        difficulty: difficulty || null,
        user_id: req.user ? Number(req.user.id) : null,
        limit: Number(req.query.limit || 10),
      });

      const data = await hydrateContents(mlResult.recommendations);

      if (req.user) await cacheResult(req.user.id, data);

      return res.status(200).json({
        success: true,
        strategy: "rule-based",
        preferred_content_type,
        is_guest: !req.user,
        total: data.length,
        data,
      });
    } catch (err) {
      return handleMlError(res, err);
    }
  },

  async contentBased(req, res) {
    try {
      const contentId = Number(req.params.contentId);
      const interaction_type = req.body.interaction_type || req.query.interaction_type || "view";

      const content = await Content.findByPk(contentId);
      if (!content) {
        return res.status(404).json({ success: false, message: "Materi tidak ditemukan di database" });
      }

      if (req.user) {
        await UserInteraction.create({
          user_id: req.user.id,
          content_id: contentId,
          interaction_type: interaction_type,
          rating: req.body.rating ?? null, 
          created_by: req.user.email || String(req.user.id),
        });
      }

      const mlResult = await mlService.contentBased({
        content_id: contentId,
        user_id: req.user ? Number(req.user.id) : null,
        interaction_type, 
        subject_id: content.subject_id,
        education_level: content.education_level,
        grade: content.grade,
        limit: Number(req.query.limit || 10),
      });

      const data = await hydrateContents(mlResult.recommendations);
      if (req.user) await cacheResult(req.user.id, data);

      return res.status(200).json({
        success: true,
        strategy: "content-based",
        based_on: { content_id: contentId, interaction_type },
        total: data.length,
        data,
      });
    } catch (err) {
      return handleMlError(res, err);
    }
  },

  async collaborative(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Akses ditolak: Login diperlukan" });
      }
      
      const userId = Number(req.user.id);
      const favoriteSubject = await getFavoriteSubject(userId);

      const mlResult = await mlService.collaborative({
        user_id: userId,
        favorite_subject: favoriteSubject,
        limit: Number(req.query.limit || 10),
      });

      const data = await hydrateContents(mlResult.recommendations);

      if (data.length > 0) {
        await cacheResult(userId, data);
        return res.status(200).json({ 
          success: true, 
          strategy: "collaborative", 
          total: data.length, 
          data 
        });
      }

      const cached = await Recommendation.findOne({ userId: userId }).lean();
      return res.status(200).json({
        success: true,
        strategy: "collaborative",
        fallback: true,
        message: "Data interaksi belum cukup untuk komputasi, menampilkan rekomendasi tersimpan.",
        total: cached?.items?.length || 0,
        data: cached?.items || [],
      });
    } catch (err) {
      return handleMlError(res, err);
    }
  },

  async myRecommendations(req, res) {
    try {
      const cached = await Recommendation.findOne({ userId: Number(req.user.id) }).lean();
      
      if (!cached || !cached.items || cached.items.length === 0) {
        return res.status(200).json({ 
          success: true, 
          message: "Belum ada rekomendasi. Silakan isi kuesioner awal terlebih dahulu.",
          total: 0,
          data: [] 
        });
      }

      return res.status(200).json({
        success: true,
        generated_at: cached.generatedAt,
        total: cached.items.length,
        data: cached.items,
      });
    } catch (err) {
      console.error("[Cache Error]", err);
      return res.status(500).json({ success: false, message: "Gagal mengambil rekomendasi dari sistem" });
    }
  },
};

module.exports = recommendationController;