"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserInteraction extends Model {
    static associate(models) {
      UserInteraction.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
      UserInteraction.belongsTo(models.Content, { foreignKey: "content_id", as: "content" });
    }
  }

  UserInteraction.init(
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.BIGINT, allowNull: false },
      content_id: { type: DataTypes.BIGINT, allowNull: false },
      // schema baru: tambah bookmark dan quiz
      interaction_type: {
        type: DataTypes.ENUM("view", "like", "bookmark", "complete", "quiz"),
        allowNull: false,
      },
      rating: { type: DataTypes.FLOAT },
    },
    {
      sequelize,
      modelName: "UserInteraction",
      tableName: "user_interactions",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  return UserInteraction;
};
