const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
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
      validate: {
        isIn: [['admin', 'user']],
      },
      defaultValue: 'user',
    },
    token: {
      type: DataTypes.JSON,
      defaultValue: [],
    }
  });

  // Hook untuk validasi email unik
  Users.addHook('beforeCreate', async (user) => {
    const existingUser = await Users.findOne({ where: { email: user.email } });
    if (existingUser) {
      throw new Error('Email is already registered');
    }
  });

  // Hook untuk hash password
  Users.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  });

  return Users;
};
