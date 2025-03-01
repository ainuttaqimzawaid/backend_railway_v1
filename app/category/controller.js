const router = require('express').Router();
const Categories = require('./model');

const index = async (req, res, next) => {
   try {
      const { search } = req.query;
      let category = '';
      if (search) {
         category = await Categories.findAll({
            where: {
               name: {
                  [Op.like]: `%${search}%`
               }
            }
         })
         return res.json(category)
      } else {
         let category = await Categories.findAll();
         return res.json(category);
      }
   } catch (err) {
      next(err);
   }
};

const view = async (req, res, next) => {
   try {
      id = req.params.id;
      let category = await Categories.findOne({
         where: {
            id
         }
      });
      return res.json(category);
   } catch (err) {
      next(err)
   }
};

const store = async (req, res, next) => {
   try {
      const { name } = req.body;
      await Categories.sync();
      let category = await Categories.create({ name });
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

const update = async (req, res, next) => {
   try {
      const id = req.params.id;
      const { name } = req.body;
      let category = await Categories.findByPk(id);
      category = await category.update({ name });
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
};

const destroy = async (req, res) => {
   const id = req.params.id;
   try {
      // Cari buku berdasarkan ID
      let category = await Categories.findByPk(id);

      await Categories.destroy({
         where: { id }
      })
      return res.json({ category, message: 'Book successfully deleted' });
   } catch (err) {
      next(err);
   }
};

module.exports = {
   index,
   view,
   store,
   update,
   destroy,
}