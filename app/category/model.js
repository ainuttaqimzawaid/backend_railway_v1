const sequelize = require('../../config/sequelize');
const { DataTypes } = require('sequelize');

const Categories = sequelize.define('Categories', {
   name: {
      type: DataTypes.STRING,
      allowNull: false,
   },
});

module.exports = Categories;