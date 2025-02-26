const router = require('express').Router()
const Books = require('./model');
const multer = require('multer');
// const os = require('os');
const fs = require('fs');
const path = require('path');

router.post('/book', multer({ dest: 'public' }).single('image'), async (req, res) => {
    const { title, author, year, isbn, status } = req.body;
    const image = req.file;
    if (image) {
        const target = path.join(__dirname, '../../public', image.originalname);
        fs.renameSync(image.path, target)
        try {
            await Books.sync();
            const result = await Books.create({ title, author, year, isbn, status, image_url: `http://localhost:5000/public/${image.originalname}` });
            res.send(result);
        } catch (error) {
            res.send(error);
        }
    }

})

module.exports = router;
