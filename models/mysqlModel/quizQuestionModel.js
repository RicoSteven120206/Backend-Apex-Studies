"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class QuizQuestion extends Model {
    static associate(models) {
      QuizQuestion.belongsTo(models.Quiz, { foreignKey: "quiz_id", as: "quiz" });
      QuizQuestion.hasMany(models.QuizOption, { foreignKey: "question_id", as: "options", onDelete: "CASCADE" });
      QuizQuestion.hasMany(models.UserQuizAnswer, { foreignKey: "question_id", as: "userAnswers" });
    }
  }

  QuizQuestion.init(
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      quiz_id: { type: DataTypes.BIGINT, allowNull: false },
      question: { type: DataTypes.TEXT, allowNull: false },
      question_type: {
        type: DataTypes.ENUM("multiple_choice", "true_false", "essay"),
        defaultValue: "multiple_choice",
      },
      score: { type: DataTypes.INTEGER, defaultValue: 10 },
    },
    {
      sequelize,
      modelName: "QuizQuestion",
      tableName: "quiz_questions",
      timestamps: false,
    }
  );

  return QuizQuestion;
};
