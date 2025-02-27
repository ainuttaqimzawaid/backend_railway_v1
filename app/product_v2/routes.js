const router = require('express').Router()
const config = require('../../config/config.js');
const Books = require('./model');
const multer = require('multer');
const os = require('os');
const fs = require('fs');
const path = require('path');

router.get('/book', async (req, res) => {
   try {
      const result = await Books.findAll();
      res.send(result);
   } catch (error) {
      res.send(error);
   }
});

router.post('/book', multer({ dest: os.tmpdir()}).single('image'), async (req, res) => {
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
            const result = await Books.create({ title, author, year, isbn, status, image_url: filename});
            res.send(result);
        } catch (error) {
            res.send(error);
        }
       })
    }
} catch (err) {
   res.send(err)
}
})

router.put('/book/:id', multer({ dest: os.tmpdir()}).single('image'), async (req, res) => {
    const id = req.params.id;
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
           // Cari buku berdasarkan ID
        let book = await Books.findByPk(id);
        let currentImage = `${config.rootPath}/public/images/books/${book.image_url}`;
        if (!book) {
            return res.status(404).json({ message: 'Buku tidak ditemukan' });
        }
        if(fs.existsSync(currentImage)) {
           fs.unlinkSync(currentImage);
        }
        
        // Update data buku
        await book.update({ title, author, year, isbn, status, image_url: filename });

        res.status(200).json({ message: 'Buku berhasil diperbarui', book });
        } catch (error) {
            res.send(error);
        }
       })
    } else {
       
    }
} catch (err) {
   res.send(err)
}
})

router.delete('/book/:id', async (req, res) => {
   const id = req.params.id;
   try {
         // Cari buku berdasarkan ID
        let book = await Books.findByPk(id);
        let currentImage = `${config.rootPath}/public/images/books/${book.image_url}`;
        if (!book) {
            return res.status(404).json({ message: 'Buku tidak ditemukan' });
        }
        if(fs.existsSync(currentImage)) {
           fs.unlinkSync(currentImage);
        }
        
      await Books.destroy({
         where:{id}
      })
      res.status(200).json({ message: 'Buku berhasil dihapus', book });
   } catch (error) {
      res.send(error);
   }
})

module.exports = router;
