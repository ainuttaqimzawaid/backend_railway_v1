const router = require('express').Router();
const Categories = require('./model');

const index = async (req, res, next) => {
   
}

const store = async (req, res, next) => {
   try {
      const {name} = req.body;
      console.log('ini halaman reqbody'+ name)
      await Categories.sync();
      let category = await Categories.create({name});
      return res.json(category);
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
   index,
   store,
}