"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserQuizAttempt extends Model {
    static associate(models) {
      UserQuizAttempt.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
      UserQuizAttempt.belongsTo(models.Quiz, { foreignKey: "quiz_id", as: "quiz" });
      UserQuizAttempt.hasMany(models.UserQuizAnswer, { foreignKey: "attempt_id", as: "answers", onDelete: "CASCADE" });
    }
  }

  UserQuizAttempt.init(
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.BIGINT, allowNull: false },
      quiz_id: { type: DataTypes.BIGINT, allowNull: false },
      score: { type: DataTypes.DECIMAL(5, 2) },
      status: { type: DataTypes.ENUM("pass", "fail") },
      started_at: { type: DataTypes.DATE },
      completed_at: { type: DataTypes.DATE },
    },
    {
      sequelize,
      modelName: "UserQuizAttempt",
      tableName: "user_quiz_attempts",
      timestamps: false,
    }
  );

  return UserQuizAttempt;
};
