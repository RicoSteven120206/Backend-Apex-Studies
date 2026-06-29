"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserQuizAnswer extends Model {
    static associate(models) {
      UserQuizAnswer.belongsTo(models.UserQuizAttempt, { foreignKey: "attempt_id", as: "attempt" });
      UserQuizAnswer.belongsTo(models.QuizQuestion, { foreignKey: "question_id", as: "question" });
      UserQuizAnswer.belongsTo(models.QuizOption, { foreignKey: "selected_option_id", as: "selectedOption" });
    }
  }

  UserQuizAnswer.init(
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      attempt_id: { type: DataTypes.BIGINT },
      question_id: { type: DataTypes.BIGINT },
      selected_option_id: { type: DataTypes.BIGINT },
    },
    {
      sequelize,
      modelName: "UserQuizAnswer",
      tableName: "user_quiz_answers",
      timestamps: false,
    }
  );

  return UserQuizAnswer;
};
