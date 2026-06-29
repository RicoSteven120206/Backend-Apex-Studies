"use strict";
const { UserInteraction, Content } = require("../models/mysqlModel");

const UserInteractionController = {
  async record(req, res) {
    try {
      const { content_id, interaction_type, rating } = req.body;

      if (!content_id || !interaction_type) {
        return res.status(400).json({
          success: false,
          message: "content_id dan interaction_type wajib diisi",
        });
      }

      const content = await Content.findByPk(content_id);
      if (!content) {
        return res.status(404).json({ success: false, message: "Materi tidak ditemukan" });
      }

      const interaction = await UserInteraction.create({
        user_id: req.user.id,
        content_id,
        interaction_type, 
        rating: rating ?? null,
        created_by: req.user.email || String(req.user.id),
      });

      return res.status(201).json({ success: true, data: interaction });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async myHistory(req, res) {
    try {
      const history = await UserInteraction.findAll({
        where: { user_id: req.user.id },
        include: [{ model: Content, as: "content" }],
        order: [["created_at", "DESC"]],
      });
      return res.json({ success: true, data: history });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },
};

module.exports = UserInteractionController;