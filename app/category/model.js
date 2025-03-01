const sequelize = require('../../config/sequelize');
const Books = require('../product_v2/model');
const { DataTypes } = require('sequelize');

const Categories = sequelize.define('Categories', {
   name: {
      type: DataTypes.STRING,
      allowNull: false,
   },
});

module.exports = Categories;