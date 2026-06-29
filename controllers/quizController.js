"use strict";
const {
  Quiz, QuizQuestion, QuizOption,
  UserQuizAttempt, UserQuizAnswer, UserInteraction, Content,
} = require("../models/mysqlModel");
const QuizResult              = require("../models/mongoModel/quizResult");
const UserActivityLog         = require("../models/mongoModel/userActivityLog");
const AnalyticsSubjectPref    = require("../models/mongoModel/analyticsSubjectPreference");

async function calculateScore(attemptId, quizId) {
  const questions = await QuizQuestion.findAll({
    where: { quiz_id: quizId },
    include: [{ model: QuizOption, as: "options", attributes: ["id", "is_correct"] }],
  });

  const answers = await UserQuizAnswer.findAll({
    where: { attempt_id: attemptId },
  });

  const answerMap = new Map(answers.map((a) => [Number(a.question_id), Number(a.selected_option_id)]));

  let totalPossible = 0;
  let totalAchieved = 0;

  for (const q of questions) {
    if (q.question_type === "essay") continue; 

    totalPossible += q.score;
    const selectedId = answerMap.get(Number(q.id));
    if (!selectedId) continue;

    const correctOption = q.options.find(
      (o) => o.is_correct && Number(o.id) === selectedId
    );
    if (correctOption) totalAchieved += q.score;
  }

  const scorePercentage = totalPossible > 0 ? (totalAchieved / totalPossible) * 100 : 0;
  return Math.round(scorePercentage * 100) / 100; 
}

async function boostSubjectOnPass(userId, contentId) {
  try {
    const content = await Content.findByPk(contentId, {
      include: [{ model: require("../models/mysqlModel").Subject, as: "subject" }],
    });
    if (!content) return;

    await AnalyticsSubjectPref.findOneAndUpdate(
      { user_id: userId, "subjects.subject_id": content.subject_id },
      { $inc: { "subjects.$.score": 15 }, $set: { updated_at: new Date() } }
    ).then(async (res) => {
      if (!res) {
        await AnalyticsSubjectPref.findOneAndUpdate(
          { user_id: userId },
          {
            $push: { subjects: { subject_id: content.subject_id, subject_name: content.subject?.name, score: 15 } },
            $set: { updated_at: new Date() },
          },
          { upsert: true }
        );
      }
    });
  } catch (e) { console.error("[SubjectBoost]", e.message); }
}

const quizController = {
  async createQuiz(req, res) {
    try {
      const { content_id, title, passing_score = 70 } = req.body;
      if (!content_id) return res.status(400).json({ success: false, message: "content_id wajib diisi" });

      const content = await Content.findByPk(content_id);
      if (!content) return res.status(404).json({ success: false, message: "Konten tidak ditemukan" });

      const existing = await Quiz.findOne({ where: { content_id } });
      if (existing) return res.status(400).json({ success: false, message: "Konten ini sudah memiliki quiz" });

      const quiz = await Quiz.create({ content_id, title, passing_score });
      return res.status(201).json({ success: true, data: quiz });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async addQuestion(req, res) {
    try {
      const { question, question_type = "multiple_choice", score = 10 } = req.body;
      if (!question) return res.status(400).json({ success: false, message: "Teks pertanyaan wajib diisi" });

      const quiz = await Quiz.findByPk(req.params.quizId);
      if (!quiz) return res.status(404).json({ success: false, message: "Quiz tidak ditemukan" });

      const q = await QuizQuestion.create({ quiz_id: quiz.id, question, question_type, score });
      return res.status(201).json({ success: true, data: q });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async addOption(req, res) {
    try {
      const { option_text, is_correct = false } = req.body;
      if (!option_text) return res.status(400).json({ success: false, message: "Teks opsi wajib diisi" });

      const question = await QuizQuestion.findByPk(req.params.questionId);
      if (!question) return res.status(404).json({ success: false, message: "Pertanyaan tidak ditemukan" });

      const option = await QuizOption.create({
        question_id: question.id,
        option_text,
        is_correct: Boolean(is_correct),
      });
      return res.status(201).json({ success: true, data: option });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async updateQuiz(req, res) {
    try {
      const quiz = await Quiz.findByPk(req.params.quizId);
      if (!quiz) return res.status(404).json({ success: false, message: "Quiz tidak ditemukan" });
      await quiz.update({ title: req.body.title, passing_score: req.body.passing_score });
      return res.json({ success: true, data: quiz });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async updateQuestion(req, res) {
    try {
      const q = await QuizQuestion.findByPk(req.params.questionId);
      if (!q) return res.status(404).json({ success: false, message: "Pertanyaan tidak ditemukan" });
      await q.update({ question: req.body.question, question_type: req.body.question_type, score: req.body.score });
      return res.json({ success: true, data: q });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async updateOption(req, res) {
    try {
      const opt = await QuizOption.findByPk(req.params.optionId);
      if (!opt) return res.status(404).json({ success: false, message: "Opsi tidak ditemukan" });
      await opt.update({ option_text: req.body.option_text, is_correct: req.body.is_correct });
      return res.json({ success: true, data: opt });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async deleteQuiz(req, res) {
    try {
      const quiz = await Quiz.findByPk(req.params.quizId);
      if (!quiz) return res.status(404).json({ success: false, message: "Quiz tidak ditemukan" });
      await quiz.destroy(); // CASCADE ke questions → options
      return res.json({ success: true, message: "Quiz dihapus" });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async deleteQuestion(req, res) {
    try {
      const q = await QuizQuestion.findByPk(req.params.questionId);
      if (!q) return res.status(404).json({ success: false, message: "Pertanyaan tidak ditemukan" });
      await q.destroy();
      return res.json({ success: true, message: "Pertanyaan dihapus" });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async adminQuizDetail(req, res) {
    try {
      const quiz = await Quiz.findByPk(req.params.quizId, {
        include: [
          {
            model: QuizQuestion, as: "questions",
            include: [{ model: QuizOption, as: "options" }],
          },
        ],
      });
      if (!quiz) return res.status(404).json({ success: false, message: "Quiz tidak ditemukan" });
      return res.json({ success: true, data: quiz });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async adminQuizList(req, res) {
    try {
      const quizzes = await Quiz.findAll({
        include: [{ model: Content, as: "content", attributes: ["id", "title", "education_level", "grade"] }],
        order: [["id", "DESC"]],
      });
      return res.json({ success: true, data: quizzes });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async getQuizForUser(req, res) {
    try {
      const quiz = await Quiz.findByPk(req.params.quizId, {
        include: [
          {
            model: QuizQuestion, as: "questions",
            include: [
              {
                model: QuizOption, as: "options",
                attributes: ["id", "option_text"], 
              },
            ],
          },
          { model: Content, as: "content", attributes: ["id", "title"] },
        ],
      });
      if (!quiz) return res.status(404).json({ success: false, message: "Quiz tidak ditemukan" });
      return res.json({ success: true, data: quiz });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async startAttempt(req, res) {
    try {
      const quiz = await Quiz.findByPk(req.params.quizId);
      if (!quiz) return res.status(404).json({ success: false, message: "Quiz tidak ditemukan" });

      const unfinished = await UserQuizAttempt.findOne({
        where: { user_id: req.user.id, quiz_id: quiz.id, completed_at: null },
      });
      if (unfinished) {
        return res.json({ success: true, message: "Melanjutkan attempt yang ada", data: unfinished });
      }

      const attempt = await UserQuizAttempt.create({
        user_id: req.user.id,
        quiz_id: quiz.id,
        started_at: new Date(),
      });

      return res.status(201).json({ success: true, data: attempt });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async submitAttempt(req, res) {
    try {
      const attempt = await UserQuizAttempt.findByPk(req.params.attemptId);
      if (!attempt)
        return res.status(404).json({ success: false, message: "Attempt tidak ditemukan" });
      if (attempt.user_id !== Number(req.user.id))
        return res.status(403).json({ success: false, message: "Bukan attempt milik Anda" });
      if (attempt.completed_at)
        return res.status(400).json({ success: false, message: "Attempt sudah selesai" });

      const { answers = [] } = req.body;

      if (answers.length) {
        await UserQuizAnswer.bulkCreate(
          answers.map((a) => ({
            attempt_id: attempt.id,
            question_id: a.question_id,
            selected_option_id: a.selected_option_id,
          })),
          { ignoreDuplicates: true }
        );
      }

      const score = await calculateScore(attempt.id, attempt.quiz_id);
      const quiz  = await Quiz.findByPk(attempt.quiz_id, {
        include: [{ model: Content, as: "content", attributes: ["id", "subject_id"] }],
      });
      const status = score >= quiz.passing_score ? "pass" : "fail";

      await attempt.update({ score, status, completed_at: new Date() });

      await UserInteraction.create({
        user_id: req.user.id,
        content_id: quiz.content_id,
        interaction_type: "quiz",
        rating: score / 20, 
      });

      await UserActivityLog.findOneAndUpdate(
        { user_id: req.user.id },
        { $push: { activities: { content_id: quiz.content_id, action: "quiz", duration_seconds: 0, created_at: new Date() } } },
        { upsert: true }
      ).catch(() => {});

      if (status === "pass") {
        await boostSubjectOnPass(req.user.id, quiz.content_id);
      }

      return res.json({
        success: true,
        data: {
          attempt_id: attempt.id,
          score,
          status,
          passing_score: quiz.passing_score,
          message: status === "pass" ? "Selamat! Kamu lulus." : `Belum lulus. Nilai minimal ${quiz.passing_score}.`,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async getAttemptResult(req, res) {
    try {
      const attempt = await UserQuizAttempt.findByPk(req.params.attemptId, {
        include: [
          {
            model: UserQuizAnswer, as: "answers",
            include: [
              { model: QuizQuestion, as: "question", attributes: ["id", "question", "score"] },
              { model: QuizOption, as: "selectedOption", attributes: ["id", "option_text", "is_correct"] },
            ],
          },
          {
            model: Quiz, as: "quiz",
            attributes: ["id", "title", "passing_score"],
          },
        ],
      });
      if (!attempt) return res.status(404).json({ success: false, message: "Attempt tidak ditemukan" });
      if (attempt.user_id !== Number(req.user.id))
        return res.status(403).json({ success: false, message: "Akses ditolak" });

      return res.json({ success: true, data: attempt });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async myAttempts(req, res) {
    try {
      const attempts = await UserQuizAttempt.findAll({
        where: { user_id: req.user.id },
        include: [{ model: Quiz, as: "quiz", include: [{ model: Content, as: "content", attributes: ["id", "title"] }] }],
        order: [["started_at", "DESC"]],
      });
      return res.json({ success: true, data: attempts });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async quizStats(req, res) {
    try {
      const attempts = await UserQuizAttempt.findAll({
        where: { quiz_id: req.params.quizId },
        attributes: ["score", "status"],
      });
      const pass  = attempts.filter((a) => a.status === "pass").length;
      const fail  = attempts.filter((a) => a.status === "fail").length;
      const avg   = attempts.length
        ? attempts.reduce((s, a) => s + Number(a.score || 0), 0) / attempts.length
        : 0;

      return res.json({
        success: true,
        data: { total_attempts: attempts.length, pass, fail, average_score: Math.round(avg * 100) / 100 },
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = quizController;
