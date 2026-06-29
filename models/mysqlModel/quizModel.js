"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Quiz extends Model {
    static associate(models) {
      Quiz.belongsTo(models.Content, { foreignKey: "content_id", as: "content" });
      Quiz.hasMany(models.QuizQuestion, { foreignKey: "quiz_id", as: "questions", onDelete: "CASCADE" });
      Quiz.hasMany(models.UserQuizAttempt, { foreignKey: "quiz_id", as: "attempts", onDelete: "CASCADE" });
    }
  }

  Quiz.init(
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      content_id: { type: DataTypes.BIGINT, allowNull: false },
      title: { type: DataTypes.STRING(255) },
      passing_score: { type: DataTypes.INTEGER, defaultValue: 70 },
    },
    {
      sequelize,
      modelName: "Quiz",
      tableName: "quizzes",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Quiz;
};
