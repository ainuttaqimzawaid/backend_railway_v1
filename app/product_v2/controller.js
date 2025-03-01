const router = require('express').Router();
const {Op} = require('sequelize');
const multer = require('multer');
const os = require('os');
const fs = require('fs');
const path = require('path');
const config = require('../../config/config.js');
const Books = require('./model');

const index = async (req, res, next) => {
   try {
      const {search} = req.query;
      let book = '';
      if (search) {
         book = await Books.findAll({
            where: {
               title: {
                  [Op.like]: `%${search}%`  // Pencarian substring dengan wildcard
               }
            }
         })
         return res.json(book)
      } else {
      let book = await Books.findAll();
      return res.json(book);
      }
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
         }
      });
      return res.json(book);
   } catch (err) {
      next(err)
   }
}

const store = async (req, res, next) => {
   try {
    const { title, author, year, isbn, status } = req.body;
    if (req.file) {
       let tmp_path = req.file.path;
       let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
       let filename = req.file.filename + '.'+ originalExt;
       let target_path = path.resolve(config.rootPath, `public/images/books/${filename}`);
       
       const src = fs.createReadStream(tmp_path);
       const dest = fs.createWriteStream(target_path);
       src.pipe(dest);
       
       src.on('end', async () => {
        try {
            await Books.sync();
            let book = await Books.create({ title, author, year, isbn, status, image_url: filename});
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
       await Books.sync();
            let book = await Books.create({ title, author, year, isbn, status});
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

const update = async (req, res) => {
    const id = req.params.id;
   try {
    const { title, author, year, isbn, status } = req.body;
        let book = await Books.findByPk(id);
    if (req.file) {
       let tmp_path = req.file.path;
       let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
       let filename = req.file.filename + '.'+ originalExt;
       let target_path = path.resolve(config.rootPath, `public/images/books/${filename}`);
       
       const src = fs.createReadStream(tmp_path);
       const dest = fs.createWriteStream(target_path);
       src.pipe(dest);
       
       src.on('end', async () => {
        try {
           // Cari buku berdasarkan ID
        let currentImage = `${config.rootPath}/public/images/books/${book.image_url}`;
        
        if(fs.existsSync(currentImage)) {
           fs.unlinkSync(currentImage);
        }
        
        // Update data buku
        await book.update({ title, author, year, isbn, status, image_url: filename });

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
        await book.update({ title, author, year, isbn, status, image_url: filename });
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

const destroy = async (req, res) => {
   const id = req.params.id;
   try {
         // Cari buku berdasarkan ID
        let book = await Books.findByPk(id);
        let currentImage = `${config.rootPath}/public/images/books/${book.image_url}`;
        if(fs.existsSync(currentImage)) {
           fs.unlinkSync(currentImage);
        }
        
      await Books.destroy({
         where:{id}
      })
      return res.json({ book, message: 'Book successfully deleted' });
   } catch (err) {
      next(err);
   }
};

module.exports = {
   index,
   view,
   store,
   update,
   destroy
}
