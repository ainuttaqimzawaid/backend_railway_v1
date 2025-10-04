// require("dotenv").config();
const { Sequelize } = require('sequelize');
//deklarasi mysql2 agar bisa digunakan divercel
require('mysql2');

let sequelize;

if (!global._sequelize) {
    global._sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: 'mysql',
            dialectModule: require('mysql2'),
            logging: false,
            pool: {
                max: 5,
                min: 0,
                idle: 10000,
            },
        }
    );
}

sequelize = global._sequelize;

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message);
    }
})();

module.exports = sequelize;