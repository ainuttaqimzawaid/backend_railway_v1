const router = require('express').Router()
const Books = require('./model');

router.post('/book', async (req, res) => {
    const { title, author, year, isbn, status } = req.body;
    try {
        // const { image_url } = req.file;
        await Books.sync();
        const result = await Books.create({ title, author, year, isbn, status });
        res.send(result);
    } catch (error) {
        res.send(error);
    }


})

module.exports = router;
