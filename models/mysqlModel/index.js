// 'use strict';

// const fs = require('fs');
// const path = require('path');
// const Sequelize = require('sequelize');
// const process = require('process');
// const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'development';
// const config = require(__dirname + '/../config/config.json')[env];
// const db = {};

// let sequelize;
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
// }

// fs
//   .readdirSync(__dirname)
//   .filter(file => {
//     return (
//       file.indexOf('.') !== 0 &&
//       file !== basename &&
//       file.slice(-3) === '.js' &&
//       file.indexOf('.test.js') === -1
//     );
//   })
//   .forEach(file => {
//     const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
//     db[model.name] = model;
//   });

// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// module.exports = db;


// const sequelize = require('../../config/mysql');
// const User = require('./userModel');
// const Subject = require('./subjectModel');
// const Content = require('./contentModel');
// const UserInteraction = require('./userInteractionModel');

// Subject.hasMany(Content, {
//   foreignKey: 'subject_id',
//   as: 'contents',
//   onDelete: 'CASCADE',
//   onUpdate: 'CASCADE'
// });

// Content.belongsTo(Subject, {
//   foreignKey: 'subject_id',
//   as: 'subjects'
// });

// User.hasMany(UserInteraction, {
//   foreignKey: 'user_id',
//   as: 'interactions',
//   onDelete: 'CASCADE',
//   onUpdate: 'CASCADE'
// });

// UserInteraction.belongsTo(User, {
//   foreignKey: 'user_id',
//   as: 'user'
// });

// Content.hasMany(UserInteraction, {
//   foreignKey: 'content_id',
//   as: 'interactions',
//   onDelete: 'CASCADE',
//   onUpdate: 'CASCADE'
// });

// UserInteraction.belongsTo(Content, {
//   foreignKey: 'content_id',
//   as: 'content'
// });

// module.exports = {
//   sequelize,
//   User,
//   Subject,
//   Content,
//   UserInteraction
// };
"use strict";
const { Sequelize } = require("sequelize");
const sequelize = require("../../config/mysql");

const db = {};

// ── Load semua model MySQL ──
db.User               = require("./userModel")(sequelize, Sequelize.DataTypes);
db.Subject            = require("./subjectModel")(sequelize, Sequelize.DataTypes);
db.Content            = require("./contentModel")(sequelize, Sequelize.DataTypes);
db.Quiz               = require("./quizModel")(sequelize, Sequelize.DataTypes);
db.QuizQuestion       = require("./quizQuestionModel")(sequelize, Sequelize.DataTypes);
db.QuizOption         = require("./quizOptionModel")(sequelize, Sequelize.DataTypes);
db.UserQuizAttempt    = require("./userQuizAttemptModel")(sequelize, Sequelize.DataTypes);
db.UserQuizAnswer     = require("./userQuizAnswerModel")(sequelize, Sequelize.DataTypes);
db.UserInteraction    = require("./userInteractionModel")(sequelize, Sequelize.DataTypes);
db.LearningPath       = require("./learningPathModel")(sequelize, Sequelize.DataTypes);
db.LearningPathContent= require("./learningPathContentModel")(sequelize, Sequelize.DataTypes);

// ── Jalankan semua associate ──
Object.values(db).forEach((model) => {
  if (typeof model.associate === "function") model.associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
