"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("user_interactions", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      user_id: {
        type: Sequelize.BIGINT, allowNull: false,
        references: { model: "users", key: "id" }, onDelete: "CASCADE",
      },
      content_id: {
        type: Sequelize.BIGINT, allowNull: false,
        references: { model: "contents", key: "id" }, onDelete: "CASCADE",
      },
      interaction_type: {
        type: Sequelize.ENUM("view", "like", "bookmark", "complete", "quiz"),
        allowNull: false,
      },
      rating: { type: Sequelize.FLOAT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable("user_interactions"); },
};
