module.exports = (sequelize, DataTypes) => {
    const Queue = sequelize.define('Queue', {
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
    }, {
        tableName: 'queues', // 🔑 samakan dengan nama tabel di DB
    });

    return Queue;
};
