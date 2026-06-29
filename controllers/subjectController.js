"use strict";
const { Subject } = require("../models/mysqlModel");

const subjectController = {
  async list(req, res) {
    const data = await Subject.findAll({ order: [["id", "ASC"]] });
    return res.json({ success: true, data });
  },

  async detail(req, res) {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json({ success: false, message: "Tidak ditemukan" });
    return res.json({ success: true, data: subject });
  },

  async create(req, res) {
    try {
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ success: false, message: "name wajib diisi" });
      const subject = await Subject.create({ name, description });
      return res.status(201).json({ success: true, data: subject });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async update(req, res) {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json({ success: false, message: "Tidak ditemukan" });
    await subject.update({ name: req.body.name, description: req.body.description });
    return res.json({ success: true, data: subject });
  },

  async remove(req, res) {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json({ success: false, message: "Tidak ditemukan" });
    await subject.destroy(); // Content terkait CASCADE
    return res.json({ success: true, message: "Subject dihapus" });
  },
};

module.exports = subjectController;