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
      const limit = parseInt(req.query.limit, 10) || 10;
      const lastId = req.query.lastId ? parseInt(req.query.lastId, 10) : null;
      const search = req.query.search || null;

      // Kondisi dasar
      const where = {};

      // Jika ada pencarian judul
      if (search) {
         where.title = { [Op.like]: `%${search}%` };
      }

      // Jika ada cursor (lastId), ambil buku dengan id lebih kecil
      if (lastId) {
         where.id = { [Op.lt]: lastId };
      }

      // Ambil data buku
      const books = await Books.findAll({
         where,
         include: [
            {
               model: Categories,
               attributes: ['id', 'name']
            },
            {
               model: Tags,
               attributes: ['id', 'name'],
               through: { attributes: [] }
            }
         ],
         order: [['id', 'DESC']], // penting untuk stabilitas cursor
         limit
      });

      // Hitung total buku (opsional — bisa dihapus kalau dataset besar)
      const totalCount = await Books.count({ where });

      // Tentukan cursor berikutnya
      const lastBook = books[books.length - 1];
      const nextCursor = lastBook ? { lastId: lastBook.id } : null;

      return res.json({
         count: totalCount,
         rows: books,
         nextCursor
      });

   } catch (err) {
      next(err);
   }
};

const favorite = async (req, res, next) => {
   try {
      // Ambil parameter dari query
      const limit = parseInt(req.query.limit, 10) || 10;
      const lastReadCount = req.query.lastReadCount ? parseInt(req.query.lastReadCount, 10) : null;
      const lastId = req.query.lastId ? parseInt(req.query.lastId, 10) : null;

      // Kondisi dasar: hanya ambil buku yang sudah dibaca minimal 1 kali
      const where = {
         readCount: {
            [Op.gte]: 1 // ambil hanya buku yang pernah dibaca
         }
      };

      // Jika ada cursor (untuk pagination)
      if (lastReadCount !== null && lastId !== null) {
         where[Op.or] = [
            { readCount: { [Op.lt]: lastReadCount } },
            {
               [Op.and]: [
                  { readCount: lastReadCount },
                  { id: { [Op.lt]: lastId } }
               ]
            }
         ];
      }

      // Query buku berdasarkan popularitas
      const books = await Books.findAll({
         where,
         order: [
            ['readCount', 'DESC'],
            ['id', 'DESC'] // untuk urutan stabil jika readCount sama
         ],
         limit
      });

      // Hitung total buku yang sudah dibaca (opsional, bisa dihapus jika dataset besar)
      const totalCount = await Books.count({
         where: { readCount: { [Op.gte]: 1 } }
      });

      // Cursor untuk request berikutnya
      const lastBook = books[books.length - 1];
      const nextCursor = lastBook
         ? { lastReadCount: lastBook.readCount, lastId: lastBook.id }
         : null;

      return res.json({
         count: totalCount,
         rows: books,
         nextCursor
      });

   } catch (err) {
      next(err);
   }
};


const newRelease = async (req, res, next) => {
   try {
      // Ambil parameter dari query
      const limit = parseInt(req.query.limit, 10) || 10;
      const lastYear = parseInt(req.query.lastYear, 10) || null;
      const lastId = parseInt(req.query.lastId, 10) || null;

      const currentYear = new Date().getFullYear();

      // Kondisi dasar: hanya buku dari 1 tahun terakhir
      const where = {
         year: {
            [Op.gte]: currentYear - 1
         }
      };

      // Jika ada cursor (year + id)
      if (lastYear && lastId) {
         where[Op.or] = [
            { year: { [Op.lt]: lastYear } },
            {
               [Op.and]: [
                  { year: lastYear },
                  { id: { [Op.lt]: lastId } }
               ]
            }
         ];
      }

      // Query buku berdasarkan tahun rilis terbaru
      const books = await Books.findAll({
         where,
         order: [
            ['year', 'DESC'], // urut dari terbaru
            ['id', 'DESC'] // stabilitas urutan
         ],
         limit
      });

      // Hitung total (opsional, bisa dihapus kalau dataset besar)
      const totalCount = await Books.count({
         where: {
            year: { [Op.gte]: currentYear - 1 }
         }
      });

      // Cursor untuk permintaan berikutnya
      const lastBook = books[books.length - 1];
      const nextCursor = lastBook
         ? { lastYear: lastBook.year, lastId: lastBook.id }
         : null;

      return res.json({
         count: totalCount,
         rows: books,
         nextCursor
      });

   } catch (err) {
      next(err);
   }
};

const newArrival = async (req, res, next) => {
   try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const days = parseInt(req.query.days, 10) || 30; // default: 30 hari terakhir

      const lastCreatedAt = req.query.lastCreatedAt || null;
      const lastId = parseInt(req.query.lastId, 10) || null;

      // Hitung batas tanggal
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      // Kondisi dasar
      const where = {
         createdAt: { [Op.gte]: fromDate }
      };

      // Jika ada cursor (paginasi lanjutan)
      if (lastCreatedAt && lastId) {
         where[Op.or] = [
            { createdAt: { [Op.lt]: new Date(lastCreatedAt) } },
            {
               [Op.and]: [
                  { createdAt: new Date(lastCreatedAt) },
                  { id: { [Op.lt]: lastId } }
               ]
            }
         ];
      }

      // Ambil data terbaru
      const books = await Books.findAll({
         where,
         order: [
            ['createdAt', 'DESC'],
            ['id', 'DESC']
         ],
         limit
      });

      // Hitung total (opsional)
      const totalCount = await Books.count({
         where: { createdAt: { [Op.gte]: fromDate } }
      });

      // Siapkan cursor berikutnya
      const lastBook = books[books.length - 1];
      const nextCursor = lastBook
         ? { lastCreatedAt: lastBook.createdAt, lastId: lastBook.id }
         : null;

      return res.json({
         count: totalCount,
         rows: books,
         nextCursor
      });
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
