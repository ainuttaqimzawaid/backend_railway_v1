module.exports = (sequelize, DataTypes) => {
   const Category = sequelize.define('Category', {
      name: {
         type: DataTypes.STRING,
         allowNull: false,
      },
   }, {
      tableName: 'categories', // 🔑 samakan dengan nama tabel di DB
   });

   return Category;
};
