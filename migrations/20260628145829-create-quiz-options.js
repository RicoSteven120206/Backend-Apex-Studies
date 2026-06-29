"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("quiz_options", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      question_id: {
        type: Sequelize.BIGINT, allowNull: false,
        references: { model: "quiz_questions", key: "id" }, onDelete: "CASCADE",
      },
      option_text: { type: Sequelize.TEXT },
      is_correct: { type: Sequelize.BOOLEAN, defaultValue: false },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable("quiz_options"); },
};
