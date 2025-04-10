const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');

// Import semua model
const Categories = require('../category/model')(sequelize, DataTypes);
const Tags = require('../tag/model')(sequelize, DataTypes);
const Books = require('../product_v2/model')(sequelize, DataTypes);

// Model perantara untuk Many-to-Many
const TagBooks = sequelize.define('TagBooks', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
}, { timestamps: false });

// relasi one to many Book dengan category
Categories.hasMany(Books, { foreignKey: 'categoryId' });
Books.belongsTo(Categories, { foreignKey: 'categoryId' });

// Relasi Many-to-Many antara Book dan Tag melalui tabel penghubung BookTag
Books.belongsToMany(Tags, { through: 'TagBooks' });
Tags.belongsToMany(Books, { through: 'TagBooks' });

module.exports = {
    sequelize,
    Sequelize,
    Books,
    Categories,
    TagBooks,
    Tags,
};