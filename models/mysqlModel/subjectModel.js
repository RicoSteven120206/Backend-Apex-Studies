"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Subject extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Subject.hasMany(models.Content, {
        foreignKey: "subject_id",
        as: "contents",
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      })
    }
  }
  
  Subject.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      }
    },
    {
      sequelize,
      modelName: "Subject",
      tableName: "subjects",
      timestamps: false, 
    }
  );
  
  return Subject;
};