// const sequelize = require('../../config/sequelize');
// const Categories = require('../category/model');
// const Tags = require('../tag/model');
// const { DataTypes } = require('sequelize');

// const Books = sequelize.define('Books', {
//     title: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     author: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     year: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//     },
//     isbn: {
//         type: DataTypes.STRING,
//         allowNull: true,
//     },
//     status: {
//         type: DataTypes.BOOLEAN,
//         allowNull: false,
//     },
//     image_url: {
//         type: DataTypes.TEXT,
//         allowNull: false,
//     },
//     categoryId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: {
//             model: Categories,
//             key: 'id',
//         },
//         onUpdate: 'CASCADE',
//         onDelete: 'CASCADE',
//     },
// });

module.exports = (sequelize, DataTypes) => {
    const Book = sequelize.define('Book', {
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
        },
    });

    return Book;
};


// // Model perantara untuk Many-to-Many
// const TagBooks = sequelize.define('TagBooks', {
//     id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true
//     },
// }, { timestamps: false });



// // Relasi Many-to-Many antara Book dan Tag melalui tabel penghubung BookTag
// Books.belongsToMany(Tags, { through: 'TagBooks' });
// Tags.belongsToMany(Books, { through: 'TagBooks' });


// module.exports = { Books, TagBooks };