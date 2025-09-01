const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');

// Import semua model
const Categories = require('../category/model')(sequelize, DataTypes);
const Tags = require('../tag/model')(sequelize, DataTypes);
const Books = require('../product_v2/model')(sequelize, DataTypes);
const Users = require('../user/model')(sequelize, DataTypes);
const Borrowings = require('../borrowing/model')(sequelize, DataTypes);
const Queues = require('../queue/model')(sequelize, DataTypes);
const Reviews = require('../review/model')(sequelize, DataTypes);

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

// Relasi one-to-Many antara Book dan Tag melalui tabel penghubung BookTag
Books.belongsToMany(Tags, { through: 'TagBooks' });
Tags.belongsToMany(Books, { through: 'TagBooks' });

// Book - Borrowing (1:M)
Books.hasMany(Borrowings, { foreignKey: 'bookId' });
Borrowings.belongsTo(Books, { foreignKey: 'bookId' });

// User - Borrowing (1:M)
Users.hasMany(Borrowings, { foreignKey: 'userId' });
Borrowings.belongsTo(Users, { foreignKey: 'userId' });

// Book - Queue (1:M)
Books.hasMany(Queues, { foreignKey: 'bookId' });
Queues.belongsTo(Books, { foreignKey: 'bookId' });

// User - Queue (1:M)
Users.hasMany(Queues, { foreignKey: 'userId' });
Queues.belongsTo(Users, { foreignKey: 'userId' });

// User - Review (1:M)
Users.hasMany(Reviews, { foreignKey: "userId" });
Reviews.belongsTo(Users, { foreignKey: "userId" });

// Book - Review (1:M)
Books.hasMany(Reviews, { foreignKey: "bookId" });
Reviews.belongsTo(Books, { foreignKey: "bookId" });

module.exports = {
    sequelize,
    Sequelize,
    Books,
    Categories,
    Tags,
    TagBooks,
    Users,
    Borrowings,
    Queues,
    Reviews,
};