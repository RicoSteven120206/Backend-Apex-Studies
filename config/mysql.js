const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE || 'apex_studies_sql',
    process.env.MYSQL_USER || 'root',
    process.env.PASSWORD || 'apexpassword123',
    {
        host: process.env.MYSQL_HOST || '127.0.0.1',
        port: process.env.MYSQL_PORT || 3330,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            underscored: true,
        },
    }

);

module.exports = sequelize;