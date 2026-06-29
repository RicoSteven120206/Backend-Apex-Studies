"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Content extends Model {
    static associate(models) {
      Content.belongsTo(models.Subject, { foreignKey: "subject_id", as: "subject" });
      Content.hasOne(models.Quiz, { foreignKey: "content_id", as: "quiz", onDelete: "CASCADE" });
      Content.hasMany(models.UserInteraction, { foreignKey: "content_id", as: "interactions", onDelete: "CASCADE" });
      Content.hasMany(models.LearningPathContent, { foreignKey: "content_id", as: "pathLinks", onDelete: "CASCADE" });
    }
  }

  Content.init(
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      subject_id: { type: DataTypes.BIGINT, allowNull: false },
      title: { type: DataTypes.STRING(255), allowNull: false },
      description: { type: DataTypes.TEXT },
      // schema baru: video, article, pdf
      content_type: { type: DataTypes.ENUM("video", "article", "pdf"), allowNull: false },
      thumbnail_url: { type: DataTypes.TEXT },
      content_url: { type: DataTypes.TEXT },
      // dipertahankan untuk sistem rekomendasi ML (rule-based filter)
      education_level: { type: DataTypes.ENUM("SD", "SMP", "SMA"), allowNull: false },
      grade: { type: DataTypes.TINYINT, allowNull: false },
      difficulty: { type: DataTypes.ENUM("easy", "medium", "hard"), allowNull: false },
      estimated_minutes: { type: DataTypes.INTEGER },
      created_by: { type: DataTypes.STRING(255) },
      updated_by: { type: DataTypes.STRING(255) },
    },
    {
      sequelize,
      modelName: "Content",
      tableName: "contents",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Content;
};
