module.exports = (sequelize, DataTypes) => {
    const Tag = sequelize.define('Tags', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        tableName: 'tags', // 🔑 samakan dengan nama tabel di DB
    });

    return Tag;
};
