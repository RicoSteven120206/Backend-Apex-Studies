"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("user_quiz_answers", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      attempt_id: { type: Sequelize.BIGINT, references: { model: "user_quiz_attempts", key: "id" }, onDelete: "CASCADE" },
      question_id: { type: Sequelize.BIGINT, references: { model: "quiz_questions", key: "id" } },
      selected_option_id: { type: Sequelize.BIGINT, references: { model: "quiz_options", key: "id" } },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable("user_quiz_answers"); },
};
