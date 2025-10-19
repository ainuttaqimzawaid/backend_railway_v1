const { Op } = require('sequelize');
// const multer = require('multer');
// const os = require('os');
const fs = require('fs');
const path = require('path');
const config = require('../../config/config.js');
const { Books, Categories, TagBooks, Tags } = require('../Assosiation/Model.js')
const cloudinary = require("../../config/cloudinary.js");
const { v4: uuidv4 } = require("uuid");
const e = require('express');
const streamifier = require('streamifier');

const index = async (req, res, next) => {
   try {
      // Ambil parameter dari query
      let limit = parseInt(req.query.limit, 10);
      let offset = parseInt(req.query.offset, 10);

      // Validasi dan default
      if (isNaN(limit) || limit <= 0) limit = 10;
      if (isNaN(offset) || offset < 0) offset = 0;

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
            limit,
            offset,
         })
         return res.json(book)
      } else {
         // Ambil parameter dari query
         let limit = parseInt(req.query.limit, 10);
         let offset = parseInt(req.query.offset, 10);

         // Validasi dan default
         if (isNaN(limit) || limit <= 0) limit = 10;
         if (isNaN(offset) || offset < 0) offset = 0;

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
            limit,
            offset,
         });
         return res.json(book);
      }
   } catch (err) {
      next(err);
      // console.error('Sequelize error:', err); // << untuk console eror sebenarnya
      // res.status(500).json({ message: err.message });
   }
};

const favorite = async (req, res, next) => {
   try {
      // Ambil parameter dari query
      let limit = parseInt(req.query.limit, 10);
      let offset = parseInt(req.query.offset, 10);

      // Validasi dan default
      if (isNaN(limit) || limit <= 0) limit = 10;
      if (isNaN(offset) || offset < 0) offset = 0;
      const books = await Books.findAndCountAll({
         order: [['readCount', 'DESC']],
         limit,
         offset,
      });
      return res.json(books);
   } catch (err) {
      next(err);
   }
};

const newRelease = async (req, res, next) => {
   try {
      // Ambil parameter dari query
      let limit = parseInt(req.query.limit, 10);
      let offset = parseInt(req.query.offset, 10);

      // Validasi dan default
      if (isNaN(limit) || limit <= 0) limit = 10;
      if (isNaN(offset) || offset < 0) offset = 0;

      const currentYear = new Date().getFullYear();

      // Ambil buku dengan tahun >= tahun sekarang - 1
      const books = await Books.findAndCountAll({
         where: {
            year: {
               [Op.gte]: currentYear - 1, // hanya 1 tahun terakhir
            },
         },
         order: [["year", "DESC"]],
         limit,
         offset,
      });
      return res.json(books);
   } catch (err) {
      next(err);
   }
};

const newArrival = async (req, res, next) => {
   try {
      // Ambil parameter dari query
      let limit = parseInt(req.query.limit, 10);
      let offset = parseInt(req.query.offset, 10);

      // Validasi dan default
      if (isNaN(limit) || limit <= 0) limit = 10;
      if (isNaN(offset) || offset < 0) offset = 0;

      const days = parseInt(req.query.days) || 30; // default: 30 hari terakhir
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const books = await Books.findAndCountAll({
         where: {
            createdAt: {
               [Op.gte]: fromDate
            }
         },
         order: [['createdAt', 'DESC']],
         limit,
         offset,
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

//task: pakai transaction karena ada insert ke Books & insert ke TagBooks (bulkcreate di branch ini belum dibuat), sehingga ini termasuk kategori multi-step operation yang sebaiknya pakai transaction.
const store = async (req, res, next) => {
   try {
      const { title, author, year, isbn, status, categoryId } = req.body;
      const category = await Categories.findOne({ where: { name: categoryId } });

      let imageUrl = null;
      let cloudinaryId = null;

      if (req.file) {
         const buffer = req.file.buffer;
         const customName = `book-${Date.now()}-${uuidv4()}`;

         // upload buffer langsung ke cloudinary
         const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
               {
                  folder: "books",
                  public_id: customName,
                  overwrite: false,
                  resource_type: "image"
               },
               (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
               }
            );
            streamifier.createReadStream(buffer).pipe(uploadStream);
         });

         imageUrl = result.secure_url;
         cloudinaryId = result.public_id;
      }

      const book = await Books.create({
         title,
         author,
         year,
         isbn,
         status,
         image_url: imageUrl,
         cloudinary_id: cloudinaryId,
         categoryId: category.id,
      });

      return res.json(book);
   } catch (err) {
      console.error(err);
      if (err && err.name === "ValidationError") {
         return res.json({
            error: 1,
            message: err.message,
            fields: err.errors,
         });
      }
      next(err);
   }
};

//task: pakai transaction karena ada update ke tabel Books & insert ke TagBooks (bulkcreate di branch ini belum dibuat), sehingga ini termasuk kategori multi-step operation yang sebaiknya pakai transaction.
const update = async (req, res, next) => {
   try {
      const { id } = req.params;
      const { title, author, year, isbn, status, categoryId } = req.body;

      const book = await Books.findByPk(id);
      if (!book) return res.status(404).json({ message: "Book not found" });

      let imageUrl = book.image_url;
      let cloudinaryId = book.cloudinary_id;

      if (req.file) {
         // Jika ada file baru, hapus file lama di cloudinary
         if (cloudinaryId) {
            await cloudinary.uploader.destroy(cloudinaryId);
         }

         // Upload file baru
         const result = await cloudinary.uploader.upload_stream(
            { folder: "books" },
            async (error, result) => {
               if (error) return next(error);

               imageUrl = result.secure_url;
               cloudinaryId = result.public_id;

               await book.update({
                  title,
                  author,
                  year,
                  isbn,
                  status,
                  categoryId,
                  image_url: imageUrl,
                  cloudinary_id: cloudinaryId,
               });

               return res.json({ message: "Book updated successfully", book });
            }
         );

         // pipe ke cloudinary
         streamifier.createReadStream(req.file.buffer).pipe(result);
      } else {
         // Jika tidak update gambar
         await book.update({
            title,
            author,
            year,
            isbn,
            status,
            categoryId,
         });

         return res.json({ message: "Book updated successfully", book });
      }
   } catch (err) {
      console.error(err);
      next(err);
   }
};


const destroy = async (req, res, next) => {
   const id = req.params.id;
   try {
      // Cari buku berdasarkan ID
      const book = await Books.findByPk(id);
      let cloudinaryId = book.cloudinary_id;
      if (cloudinaryId) {
         await cloudinary.uploader.destroy(cloudinaryId);
      }

      await Books.destroy({
         where: { id }
      })
      await TagBooks.destroy({
         where: { id }
      })
      return res.json({
         book,
         message: 'Book successfully deleted'
      });
   } catch (err) {
      console.error(err);
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
