const router = require('express').Router();
const Users = require('../user/model');
const bcrypt = require('bcrypt');
const passport = require('passport')


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
      let user = await User
         .findOne({ email })
         .select('-__v -createdAt -updatedAt -cart_items -token');

      if (!user) return done();
      if (bcrypt.compareSync(password, user.password)) {
         ({ password, ...userWithoutPassword } = user.toJSON());
         return done(null, userWithoutPassword);
      }
   } catch (err) {
      done(err, null)
   }
   done();
}

const login = async (req, res, next) => {
   passport.authenticate('local', async function (err, user) {
      if (err) return next(err);

      if (!user) return res.json({ error: 1, message: 'Email or password incorrect' });

      let signed = jwt.sign(user, config.secretkey);

      await Users.findByIdAndUpdate(user._id, { $push: { token: signed } });

      res.json({
         message: 'Login successfully',
         user,
         token: signed
      })
   })(req, res, next)
}

module.exports = {
   register,
   localStrategy,
   login
}