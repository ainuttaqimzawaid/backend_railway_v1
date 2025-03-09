const router = require('express').Router();
const Users = require('../user/model');


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

module.exports = {
   register
}