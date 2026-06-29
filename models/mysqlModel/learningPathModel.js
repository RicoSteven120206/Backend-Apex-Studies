"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class LearningPath extends Model {
    static associate(models) {
      LearningPath.hasMany(models.LearningPathContent, {
        foreignKey: "learning_path_id",
        as: "pathContents",
        onDelete: "CASCADE",
      });
    }
  }

  LearningPath.init(
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      title: { type: DataTypes.STRING(255) },
      description: { type: DataTypes.TEXT },
    },
    {
      sequelize,
      modelName: "LearningPath",
      tableName: "learning_paths",
      timestamps: false,
    }
  );

  return LearningPath;
};
