"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("quizzes", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      content_id: {
        type: Sequelize.BIGINT, allowNull: false,
        references: { model: "contents", key: "id" }, onDelete: "CASCADE",
      },
      title: { type: Sequelize.STRING(255) },
      passing_score: { type: Sequelize.INTEGER, defaultValue: 70 },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable("quizzes"); },
};
