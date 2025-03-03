const sequelize = require('../../config/sequelize');
const { DataTypes } = require('sequelize');

const Tags = sequelize.define('Tags', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Relasi Many-to-Many antara Tag dan Book melalui tabel penghubung BookTag
//Tags.belongsToMany(Books, { through: 'BookTag' });
//Books.belongsToMany(Tags, { through: 'BookTag' });


module.exports = Tags;