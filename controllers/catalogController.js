"use strict";
const { Content, Subject, UserInteraction, User } = require("../models/mysqlModel");
const { fn, col, literal } = require("../models/mysqlModel").Sequelize;

const catalogController = {
  async index(req, res) {
    try {
      if (req.user.role === "admin") {
        return catalogController._adminCatalog(req, res);
      }
      return catalogController._userCatalog(req, res);
    } catch (error) {
      console.error("catalog:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async _userCatalog(req, res) {
    const { education_level, grade, id: userId } = req.user;
    const { subject_id, content_type, difficulty } = req.query;

    const where = { education_level, grade }; 
    if (subject_id) where.subject_id = subject_id;
    if (content_type) where.content_type = content_type;
    if (difficulty) where.difficulty = difficulty;

    const contents = await Content.findAll({
      where,
      include: [
        { model: Subject, as: "subjects", attributes: ["id", "name"] },
        {
          model: UserInteraction,
          as: "interactions",
          where: { user_id: userId },
          required: false, 
          attributes: ["interaction_type", "rating"],
        },
      ],
      order: [["id", "DESC"]],
    });

    const data = contents.map((c) => {
      const json = c.toJSON();
      const types = (json.interactions || []).map((i) => i.interaction_type);
      json.progress = types.includes("complete")
        ? "completed"
        : types.includes("view")
        ? "in_progress"
        : "not_started";
      return json;
    });

    return res.json({
      success: true,
      role: "user",
      profile: { education_level, grade },
      total: data.length,
      data,
    });
  },

  async _adminCatalog(req, res) {
    const { subject_id, education_level, grade, content_type, difficulty } = req.query;

    const where = {};
    if (subject_id) where.subject_id = subject_id;
    if (education_level) where.education_level = education_level;
    if (grade) where.grade = grade;
    if (content_type) where.content_type = content_type;
    if (difficulty) where.difficulty = difficulty;

    const contents = await Content.findAll({
      where,
      include: [{ model: Subject, as: "subjects", attributes: ["id", "name"] }],
      order: [["id", "DESC"]],
    });

    const [totalUsers, totalContents, totalQuiz] = await Promise.all([
      User.count(),
      Content.count(),
      Content.count({ where: { content_type: "quiz" } }),
    ]);

    const byType = await Content.findAll({
      attributes: ["content_type", [fn("COUNT", col("id")), "total"]],
      group: ["content_type"],
      raw: true,
    });

    return res.json({
      success: true,
      role: "admin",
      summary: {
        total_users: totalUsers,
        total_contents: totalContents,
        total_quiz: totalQuiz,
        by_content_type: byType,
      },
      total: contents.length,
      data: contents,
    });
  },
};

module.exports = catalogController;