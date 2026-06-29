'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("contents", {
      id: { 
        type: Sequelize.BIGINT, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
      },
      subject_id: {
        // Tipe data harus sama dengan ID di tabel subjects (INTEGER)
        type: Sequelize.BIGINT, 
        allowNull: false,
        references: { model: "subjects", key: "id" }, 
        onDelete: "CASCADE", 
        onUpdate: "CASCADE"
      },
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },
      content_type: { type: Sequelize.ENUM("video", "article", "pdf"), allowNull: false },
      thumbnail_url: { type: Sequelize.TEXT },
      content_url: { type: Sequelize.TEXT },
      education_level: { type: Sequelize.ENUM("SD", "SMP", "SMA"), allowNull: false },
      grade: { type: Sequelize.TINYINT, allowNull: false },
      difficulty: { type: Sequelize.ENUM("easy", "medium", "hard"), allowNull: false },
      estimated_minutes: { type: Sequelize.INTEGER },
      created_by: { type: Sequelize.STRING(255) },
      updated_by: { type: Sequelize.STRING(255) },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("contents");
  },
};