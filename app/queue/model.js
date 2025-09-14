module.exports = (sequelize, DataTypes) => {
    const Queue = sequelize.define('queue', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        bookId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('waiting', 'notified', 'canceled'),
            defaultValue: 'waiting',
        }
    });

    return Queue;
};
