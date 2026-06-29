"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("learning_path_contents", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      learning_path_id: {
        type: Sequelize.BIGINT,
        references: { model: "learning_paths", key: "id" }, onDelete: "CASCADE",
      },
      content_id: {
        type: Sequelize.BIGINT,
        references: { model: "contents", key: "id" }, onDelete: "CASCADE",
      },
      sequence_order: { type: Sequelize.INTEGER },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable("learning_path_contents"); },
};
