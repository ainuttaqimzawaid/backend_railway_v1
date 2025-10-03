const { fn, col } = require('sequelize');
const { Books, Categories, sequelize } = require('../Assosiation/Model')

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
            },
            include: [
               {
                  model: Books,
               }
            ],
         })
         return res.json(category)
      } else {
         let category = await Categories.findAll({
            include: [
               {
                  model: Books,
               }
            ],
         });
         return res.json(category);
      }
   } catch (err) {
      next(err);
      // console.error('Sequelize error:', err); // << penting
      // res.status(500).json({ message: err.message });
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
      await Categories.sync();

      let categories;

      if (Array.isArray(req.body)) {
         // Bulk insert
         categories = await Categories.bulkCreate(req.body);
      } else {
         // Single insert
         const { name } = req.body;
         categories = await Categories.create({ name });
      }

      return res.json(categories);
   } catch (err) {
      if (err && err.name === 'ValidationError') {
         return res.json({
            error: 1,
            message: err.message,
            fields: err.errors
         });
      }
      next(err);
   }
};


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
      return res.json({ category, message: 'Category successfully deleted' });
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