module.exports = (sequelize, DataTypes) => {
    const Tag = sequelize.define('Tags', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    return Tag;
};
