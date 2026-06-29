"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("user_quiz_attempts", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      user_id: {
        type: Sequelize.BIGINT, allowNull: false,
        references: { model: "users", key: "id" }, onDelete: "CASCADE",
      },
      quiz_id: {
        type: Sequelize.BIGINT, allowNull: false,
        references: { model: "quizzes", key: "id" }, onDelete: "CASCADE",
      },
      score: { type: Sequelize.DECIMAL(5, 2) },
      status: { type: Sequelize.ENUM("pass", "fail") },
      started_at: { type: Sequelize.DATE },
      completed_at: { type: Sequelize.DATE },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable("user_quiz_attempts"); },
};
