require("dotenv").config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10), // pastikan integer
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false, // biar kompatibel dengan hosting DB (Railway/Planetscale)
            },
        },
    }
);

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message);
    }
})();

module.exports = sequelize;
