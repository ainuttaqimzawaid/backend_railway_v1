const sequelize = require('../../config/sequelize');
const Categories = require('../category/model');
const { DataTypes } = require('sequelize');

const Books = sequelize.define('Books', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    isbn: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    image_url: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Categories,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
});

// Definisi relasi One-to-Many
Categories.hasMany(Books, { foreignKey: 'categoryId' });
Books.belongsTo(Categories, { foreignKey: 'categoryId' });

module.exports = Books;