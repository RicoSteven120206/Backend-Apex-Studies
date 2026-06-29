// const { DataTypes } = require('sequelize');
// const sequelize = require('../../config/mysql');
// const { combineTableNames, underscoredIf } = require('sequelize/lib/utils');

// const User = sequelize.define('User', {
//     id: {
//         type: DataTypes.BIGINT, 
//         primaryKey: true,
//         autoIncrement: true
//     },
//     name: {
//         type: DataTypes.STRING(200),
//         allowNull: false
//     },
//     email: {
//         type: DataTypes.STRING(200),
//         unique: true,
//         allowNull: false
//     },
//     password: {
//         type: DataTypes.STRING(255),
//         allowNull: false
//     },
//     education_level: {
//         type: DataTypes.ENUM('SD', 'SMP', 'SMA'),
//         allowNull: false
//     },
//     grade: {
//         type: DataTypes.TINYINT,
//         allowNull: false
//     },
//     is_active: {
//         type: DataTypes.BOOLEAN,
//         allowNull: false
//     },
//     created_by: {
//         type: DataTypes.STRING,
//         field: 'created_by'
//     },
//     updated_by: {
//         type: DataTypes.STRING,
//         field: 'updated_by'
//     }
// }, {
//     tableName: 'users',
//     timestamps: true,
//     underscored: true,
// });

// module.exports = User;

// "use strict";
// const { Model } = require("sequelize");

// module.exports = (sequelize, DataTypes) => {
//   class User extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {
//       // define association here
//       // (Nantinya relasi seperti User.hasMany(models.UserInteraction) diletakkan di sini)
//       User.hasMany(models.UserInteraction, {
//         foreignKey: "user_id",
//         as: "interactions",
//         onDelete: "CASCADE",
//         onUpdate: "CASCADE"
//       });
//     }
//   }

//   User.init(
//     {
//       id: {
//         type: DataTypes.BIGINT,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       name: {
//         type: DataTypes.STRING(200),
//         allowNull: false,
//       },
//       email: {
//         type: DataTypes.STRING(200),
//         unique: true,
//         allowNull: false,
//       },
//       password: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//       },
//       education_level: {
//         type: DataTypes.ENUM('SD', 'SMP', 'SMA'),
//         allowNull: false,
//       },
//       grade: {
//         type: DataTypes.TINYINT,
//         allowNull: false,
//       },
//       is_active: {
//         type: DataTypes.BOOLEAN,
//         allowNull: false,
//       },
//       created_by: {
//         type: DataTypes.STRING,
//         field: 'created_by',
//       },
//       updated_by: {
//         type: DataTypes.STRING,
//         field: 'updated_by',
//       }
//     },
//     {
//       sequelize,
//       modelName: "User",
//       tableName: "users",
//       timestamps: true,
//       underscored: true,
//       createdAt: "created_at",
//       updatedAt: "updated_at",
//     }
//   );

//   return User;
// };

"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.UserInteraction, {
        foreignKey: "user_id",
        as: "interactions",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }

    // Dipakai loginUser untuk cek password
    async matchPassword(plainPassword) {
      return bcrypt.compare(plainPassword, this.password);
    }
  }

  User.init(
    {
      id: { 
        type: DataTypes.BIGINT, 
        primaryKey: true, 
        autoIncrement: true 
      },
      name: { 
        type: DataTypes.STRING(200), 
        allowNull: false 
      },
      email: { 
        type: DataTypes.STRING(200), 
        unique: true, 
        allowNull: false 
      },
      password: { 
        type: DataTypes.STRING(255), 
        allowNull: false 
      },
      education_level: { 
        type: DataTypes.ENUM("SD", "SMP", "SMA"), 
        allowNull: false 
      },
      grade: { 
        type: DataTypes.TINYINT, 
        allowNull: false 
      },

      // ▼▼▼ KOLOM BARU ▼▼▼
      role: {
        type: DataTypes.ENUM("admin", "user"),
        allowNull: false,
        defaultValue: "user",
      },
      // ▲▲▲

      is_active: { 
        type: DataTypes.BOOLEAN, 
        allowNull: false, 
        defaultValue: true 
      },
      created_by: { 
        type: DataTypes.STRING, 
        field: "created_by" 
      },
      updated_by: { 
        type: DataTypes.STRING, 
        field: "updated_by" 
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",

      // Hash password otomatis — tak perlu bcrypt manual lagi di controller
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) user.password = await bcrypt.hash(user.password, 10);
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },

      // Default-nya password ikut tereksklusi saat query
      defaultScope: { attributes: { exclude: ["password"] } },
      scopes: { withPassword: { attributes: {} } },
    }
  );

  return User;
};