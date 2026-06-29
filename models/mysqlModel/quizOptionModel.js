"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class QuizOption extends Model {
    static associate(models) {
      QuizOption.belongsTo(models.QuizQuestion, { foreignKey: "question_id", as: "question" });
    }
  }

  QuizOption.init(
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      question_id: { type: DataTypes.BIGINT, allowNull: false },
      option_text: { type: DataTypes.TEXT },
      is_correct: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize,
      modelName: "QuizOption",
      tableName: "quiz_options",
      timestamps: false,
    }
  );

  return QuizOption;
};
