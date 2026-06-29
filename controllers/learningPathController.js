"use strict";
const { LearningPath, LearningPathContent, Content, Subject, UserInteraction } = require("../models/mysqlModel");

const learningPathController = {
  async list(req, res) {
    try {
      const paths = await LearningPath.findAll({
        include: [
          {
            model: LearningPathContent,
            as: "pathContents",
            include: [{ model: Content, as: "content", attributes: ["id", "title", "content_type", "estimated_minutes"] }],
            order: [["sequence_order", "ASC"]],
          },
        ],
      });
      return res.json({ success: true, data: paths });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async detail(req, res) {
    try {
      const path = await LearningPath.findByPk(req.params.id, {
        include: [
          {
            model: LearningPathContent,
            as: "pathContents",
            include: [
              {
                model: Content,
                as: "content",
                include: [{ model: Subject, as: "subject", attributes: ["id", "name"] }],
              },
            ],
            order: [["sequence_order", "ASC"]],
          },
        ],
      });
      if (!path) return res.status(404).json({ success: false, message: "Learning path tidak ditemukan" });

      let result = path.toJSON();
      if (req.user) {
        const contentIds = result.pathContents.map((pc) => pc.content_id);
        const interactions = await UserInteraction.findAll({
          where: { user_id: req.user.id, content_id: contentIds },
          attributes: ["content_id", "interaction_type"],
        });
        const doneSet = new Set(
          interactions.filter((i) => i.interaction_type === "complete").map((i) => Number(i.content_id))
        );
        result.pathContents = result.pathContents.map((pc) => ({
          ...pc,
          is_completed: doneSet.has(Number(pc.content_id)),
        }));
      }

      return res.json({ success: true, data: result });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async create(req, res) {
    try {
      const { title, description } = req.body;
      if (!title) return res.status(400).json({ success: false, message: "title wajib diisi" });
      const path = await LearningPath.create({ title, description });
      return res.status(201).json({ success: true, data: path });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async update(req, res) {
    try {
      const path = await LearningPath.findByPk(req.params.id);
      if (!path) return res.status(404).json({ success: false, message: "Tidak ditemukan" });
      await path.update({ title: req.body.title, description: req.body.description });
      return res.json({ success: true, data: path });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async remove(req, res) {
    try {
      const path = await LearningPath.findByPk(req.params.id);
      if (!path) return res.status(404).json({ success: false, message: "Tidak ditemukan" });
      await path.destroy();
      return res.json({ success: true, message: "Learning path dihapus" });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async addContent(req, res) {
    try {
      const { content_id, sequence_order } = req.body;
      if (!content_id) return res.status(400).json({ success: false, message: "content_id wajib" });

      const path = await LearningPath.findByPk(req.params.id);
      if (!path) return res.status(404).json({ success: false, message: "Learning path tidak ditemukan" });

      const content = await Content.findByPk(content_id);
      if (!content) return res.status(404).json({ success: false, message: "Konten tidak ditemukan" });

      let order = sequence_order;
      if (!order) {
        const max = await LearningPathContent.max("sequence_order", {
          where: { learning_path_id: req.params.id },
        });
        order = (max || 0) + 1;
      }

      const link = await LearningPathContent.create({
        learning_path_id: req.params.id,
        content_id,
        sequence_order: order,
      });
      return res.status(201).json({ success: true, data: link });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async removeContent(req, res) {
    try {
      const link = await LearningPathContent.findOne({
        where: { learning_path_id: req.params.id, content_id: req.params.contentId },
      });
      if (!link) return res.status(404).json({ success: false, message: "Konten tidak ada di path ini" });
      await link.destroy();
      return res.json({ success: true, message: "Konten dihapus dari learning path" });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async reorder(req, res) {
    try {
      const { order } = req.body; 
      if (!Array.isArray(order)) return res.status(400).json({ success: false, message: "order harus array" });

      await Promise.all(
        order.map((item) =>
          LearningPathContent.update(
            { sequence_order: item.sequence_order },
            { where: { learning_path_id: req.params.id, content_id: item.content_id } }
          )
        )
      );
      return res.json({ success: true, message: "Urutan diperbarui" });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = learningPathController;
