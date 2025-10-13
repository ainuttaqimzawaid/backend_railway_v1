const { Op } = require('sequelize');
const multer = require('multer');
const os = require('os');
const fs = require('fs');
const path = require('path');
const config = require('../../config/config.js');
const { Books, Categories, TagBooks, Tags } = require('../Assosiation/Model.js')

const index = async (req, res, next) => {
   try {
      const { search } = req.query;
      let book = '';
      if (search) {
         book = await Books.findAndCountAll({
            where: {
               title: {
                  [Op.like]: `%${search}%`  // Pencarian substring dengan wildcard
               }
            },
            include: [
               {
                  model: Categories, // Mengambil data Category yang berelasi dengan Book
                  attributes: ['id', 'name'] // Menampilkan id dan name dari Category
               },
               {
                  model: Tags, // Mengambil data Tag yang berelasi dengan Book
                  attributes: ['id', 'name'],
                  through: {
                     attributes: [] // Menghilangkan atribut dari tabel penghubung (BookTags)
                  }
               }
            ],
            limit: 20,
            offset: 0,
         })
         return res.json(book)
      } else {
         book = await Books.findAndCountAll({
            include: [
               {
                  model: Categories, // Mengambil data Category yang berelasi dengan Book
                  attributes: ['id', 'name'] // Menampilkan id dan name dari Category
               },
               {
                  model: Tags, // Mengambil data Tag yang berelasi dengan Book
                  attributes: ['id', 'name'],
                  through: {
                     attributes: [] // Menghilangkan atribut dari tabel penghubung (BookTags)
                  }
               }
            ],
            limit: 20,
            // offset: 5, //skip row
         });
         return res.json(book);
      }
   } catch (err) {
      next(err);
   }
};

const favorite = async (req, res, next) => {
   try {
      const books = await Books.findAll({
         order: [['readCount', 'DESC']],
         limit: 5
      });
      return res.json(books);
   } catch (err) {
      next(err);
   }
};

const newRelease = async (req, res, next) => {
   try {
      const books = await Books.findAll({
         order: [['year', 'DESC']],
         limit: 5
      });
      return res.json(books);
   } catch (err) {
      next(err);
   }
};

const newArrival = async (req, res, next) => {
   try {
      const days = parseInt(req.query.days) || 30; // default: 30 hari terakhir
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const books = await Books.findAll({
         where: {
            createdAt: {
               [Op.gte]: fromDate
            }
         },
         order: [['createdAt', 'DESC']],
         limit: parseInt(req.query.limit) || 10
      });

      return res.json(books);
   } catch (err) {
      next(err);
   }
};

const view = async (req, res, next) => {
   try {
      id = req.params.id;
      let book = await Books.findOne({
         where: {
            id
         },
         include: [
            {
               model: Categories, // Mengambil data Category yang berelasi dengan Book
               attributes: ['id', 'name'] // Menampilkan id dan name dari Category
            },
            {
               model: Tags, // Mengambil data Tag yang berelasi dengan Book
               attributes: ['id', 'name'],
               through: {
                  attributes: [] // Menghilangkan atribut dari tabel penghubung (BookTags)
               }
            }
         ]
      });
      return res.json(book);
   } catch (err) {
      next(err)
   }
};

const store = async (req, res, next) => {
   try {
      let payload = req.body;
      console.log(payload.category);
      const category = await Categories.findOne({ where: { name: payload.category } });

      if (req.file) {
         let tmp_path = req.file.path;
         let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
         let filename = req.file.filename + '.' + originalExt;
         let target_path = path.resolve(config.rootPath, `public/images/books/${filename}`);

         const src = fs.createReadStream(tmp_path);
         const dest = fs.createWriteStream(target_path);
         src.pipe(dest);

         src.on('end', async () => {
            try {
               await Books.sync();
               await TagBooks.sync()
               let book = await Books.create({ ...payload, image_url: filename, categoryId: category.id, });
               return res.json(book);
            } catch (err) {
               fs.unlinkSync(target_path);
               if (err && err.name === 'ValidationError') {
                  return res.json({
                     error: 1,
                     message: err.message,
                     fields: err.errors
                  })
               }
               next(err);
            }
         })

         src.on('error', async () => {
            next(err);
         });
      } else {
         // await Books.sync();
         // let book = await Books.create({ title, author, year, isbn, status, categoryId: category.id, });

         let book;
         if (Array.isArray(req.body)) {
            // Bulk insert
            book = await Books.bulkCreate(payload);
         } else {
            // Single insert
            book = await Books.create(payload);
         }
         return res.json(book);
      }
   } catch (err) {
      if (err && err.name === 'ValidationError') {
         return res.json({
            error: 1,
            message: err.message,
            fields: err.errors
         })
      }
      next(err)
   }
};

const update = async (req, res, next) => {
   try {
      const id = req.params.id;
      const { title, author, year, isbn, status, categoryId } = req.body;
      let tagNames = [];

      if (req.body.tagNames && typeof req.body.tagNames === 'string') {
         tagNames = req.body.tagNames.split(',').map(name => name.trim());
      } else {
         console.log('tagNames tidak dikirim atau bukan string!');
      }

      const tags = await Tags.findAll({
         where: {
            name: {
               [Op.in]: tagNames
            }
         }
      })
      const category = await Categories.findOne({ where: { name: categoryId } });
      // Buat array data untuk insert ke tabel perantara
      const booktags = tags.map(tagId => ({
         TagId: tagId.id, // Convert string ke integer
         BookId: parseInt(id)
      }));

      let book = await Books.findByPk(id);
      if (req.file) {
         let tmp_path = req.file.path;
         let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
         let filename = req.file.filename + '.' + originalExt;
         let target_path = path.resolve(config.rootPath, `public/images/books/${filename}`);

         const src = fs.createReadStream(tmp_path);
         const dest = fs.createWriteStream(target_path);
         src.pipe(dest);

         src.on('end', async () => {
            try {
               // Cari buku berdasarkan ID
               let currentImage = `${config.rootPath}/public/images/books/${book.image_url}`;

               if (fs.existsSync(currentImage)) {
                  fs.unlinkSync(currentImage);
               }

               // Update data buku
               await book.update({ title, author, year, isbn, status, image_url: filename, categoryId: category.id, });
               // Simpan semua relasi sekaligus
               await TagBooks.bulkCreate(booktags);

               return res.json({ book, message: 'Successfully updated' });
            } catch (err) {
               fs.unlinkSync(target_path);
               if (err && err.name === 'ValidationError') {
                  return res.json({
                     error: 1,
                     message: err.message,
                     fields: err.errors
                  })
               }
               next(err);
            }
         })

         src.on('error', async () => {
            next(err)
         })
      } else {
         // Update data buku
         await book.update({ title, author, year, isbn, status, image_url: filename, categoryId: category.id, });
         // Simpan semua relasi sekaligus
         await TagBooks.bulkCreate(booktags);
         return res.json({ book, message: 'Successfully updated' });
      }
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

const destroy = async (req, res, next) => {
   const id = req.params.id;
   try {
      // Cari buku berdasarkan ID
      let book = await Books.findByPk(id);
      let currentImage = `${config.rootPath}/public/images/books/${book.image_url}`;
      if (fs.existsSync(currentImage)) {
         fs.unlinkSync(currentImage);
      }

      await Books.destroy({
         where: { id }
      })
      await TagBooks.destroy({
         where: { id }
      })
      return res.json({ book, message: 'Book successfully deleted' });
   } catch (err) {
      next(err);
   }
};

module.exports = {
   index,
   favorite,
   newArrival,
   newRelease,
   view,
   store,
   update,
   destroy
}
