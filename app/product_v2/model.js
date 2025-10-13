module.exports = (sequelize, DataTypes) => {
    const Book = sequelize.define('book', {
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
        readCount: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        image_url: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        totalCopies: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        availableCopies: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        }
    });

    return Book;
};