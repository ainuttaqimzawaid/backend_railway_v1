const router = require('express').Router();
const Users = require('../user/model');
const bcrypt = require('bcrypt');
const passport = require('passport');
const config = require('../../config/config');
const jwt = require('jsonwebtoken');
const { getToken } = require('../../utils');
const { Op, Sequelize } = require('sequelize');


const register = async (req, res, next) => {
   try {
      const { userName, email, password, role } = req.body;
      await Users.sync();
      let user = await Users.create({ userName, email, password, role });
      return res.json(user);
   } catch (err) {
      if (err && err.name === 'ValidationError') {
         return res.json({
            error: 1,
            message: err.message,
            fields: err.errors
         })
      }
      next(err);
   }
}

const localStrategy = async (email, password, done) => {
   try {
      console.log('email');

      let user = await Users.findOne({
         where: { email }, // Sequelize query harus pakai `where`
         attributes: { exclude: ['createdAt', 'updatedAt', 'cart_items', 'token'] } // Gunakan exclude untuk menghapus atribut
      });

      if (!user) return done(null, false, { message: 'User not found' });

      // Bandingkan password dengan bcrypt
      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) return done(null, false, { message: 'Incorrect password' });

      // Ubah user menjadi objek biasa
      const userWithoutPassword = user.get({ plain: true });
      delete userWithoutPassword.password; // Hapus password dari response

      return done(null, userWithoutPassword);
   } catch (err) {
      return done(err, null);
   }
};

const login = async (req, res, next) => {
   passport.authenticate('local', async function (err, user) {
      if (err) return next(err);

      if (!user) return res.json({ error: 1, message: 'Email or password incorrect' });

      let signed = jwt.sign(user, config.secretKey);
      let User = await Users.findOne({ where: { id: user.id } });
      User.token.push(signed);
      await Users.update(
         { token: User.token },
         { where: { id: User.id } }
      );

      res.json({
         message: 'Login successfully',
         user,
         token: signed,
      })
   })(req, res, next)
}

const logout = async (req, res, next) => {
   try {
      let token = getToken(req);
      if (!token) {
         return res.json({
            error: 1,
            message: 'No Token Provided'
         });
      }

      // Cari user dengan token yang cocok
      let user = await Users.findOne({
         where: Sequelize.literal(`JSON_CONTAINS(token, token)`)
      });

      if (!user) {
         return res.json({
            error: 1,
            message: 'No User Found!!!'
         });
      }

      tokens = user.token.filter(t => t !== token); // Hapus token

      // Update data user dengan token baru
      await Users.update(
         { token: tokens }, // Simpan kembali dalam format JSON string
         { where: { id: user.id } }
      );

      return res.json({
         error: 0,
         message: 'Logout berhasil'
      });
   } catch (err) {
      next(err);
   }
};

const me = (req, res, next) => {
   if (!req.user) {
      res.json({
         err: 1,
         message: `You're not login or token expired`
      })
   }

   res.json(req.user);
}

module.exports = {
   register,
   localStrategy,
   login,
   logout,
   me,
}