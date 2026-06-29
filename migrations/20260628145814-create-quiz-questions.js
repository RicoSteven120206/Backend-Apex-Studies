"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("quiz_questions", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      quiz_id: {
        type: Sequelize.BIGINT, allowNull: false,
        references: { model: "quizzes", key: "id" }, onDelete: "CASCADE",
      },
      question: { type: Sequelize.TEXT, allowNull: false },
      question_type: {
        type: Sequelize.ENUM("multiple_choice", "true_false", "essay"),
        defaultValue: "multiple_choice",
      },
      score: { type: Sequelize.INTEGER, defaultValue: 10 },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable("quiz_questions"); },
};
