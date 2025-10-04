const path = require('path');
// const { env } = require('process');
// require('dotenv').config();

const config = {
  rootPath: path.resolve(__dirname, '..'), // Menetapkan root path proyek
  secretKey: process.env.SECRET_KEY,
};

module.exports = config;
