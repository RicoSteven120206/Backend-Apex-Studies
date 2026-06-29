"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("learning_paths", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      title: { type: Sequelize.STRING(255) },
      description: { type: Sequelize.TEXT },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable("learning_paths"); },
};
