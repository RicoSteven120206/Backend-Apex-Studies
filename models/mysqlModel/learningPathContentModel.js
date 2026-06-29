"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class LearningPathContent extends Model {
    static associate(models) {
      LearningPathContent.belongsTo(models.LearningPath, {
        foreignKey: "learning_path_id",
        as: "learningPath",
      });
      LearningPathContent.belongsTo(models.Content, {
        foreignKey: "content_id",
        as: "content",
      });
    }
  }

  LearningPathContent.init(
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      learning_path_id: { type: DataTypes.BIGINT },
      content_id: { type: DataTypes.BIGINT },
      sequence_order: { type: DataTypes.INTEGER },
    },
    {
      sequelize,
      modelName: "LearningPathContent",
      tableName: "learning_path_contents",
      timestamps: false,
    }
  );

  return LearningPathContent;
};
