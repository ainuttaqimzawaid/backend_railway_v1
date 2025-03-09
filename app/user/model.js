const sequelize = require('../../config/sequelize');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

const Users = sequelize.define('Users', {
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    isIn: [['admin', 'user']],
    defaultValue: 'user',
  },
  token: {
    type: DataTypes.JSON, // Menyimpan array token dalam format JSON
    defaultValue: [],
  }
});

// Validasi tambahan bisa ditambahkan di sini
Users.addHook('beforeCreate', async (user) => {
  // Anda bisa menambahkan logika khusus untuk validasi tambahan sebelum data disimpan
  const existingUser = await Users.findOne({ where: { email: user.email } });
  if (existingUser) {
    throw new Error('Email is already registered');
  }
});

// Hook untuk hashing password sebelum disimpan ke database
Users.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10); // menghasilkan salt untuk hashing
  user.password = await bcrypt.hash(user.password, salt); // hashing password
});

// Metode untuk memvalidasi password saat login
// Users.prototype.validPassword = async function (password) {
//   return await bcrypt.compare(password, this.password); // membandingkan password yang dimasukkan dengan hash yang ada di database
// };

module.exports = Users;