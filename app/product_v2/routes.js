const router = require('express').Router();
const bookController = require('./controller');
const multer = require('multer');
const os = require('os');

router.get('/book', bookController.index);
router.get('/book/:id', bookController.view);
router.post('/book', multer({ dest: os.tmpdir()}).single('image'), bookController.store)
router.put('/book/:id', multer({ dest: os.tmpdir()}).single('image'), bookController.update)
router.delete('/book/:id', bookController.destroy)

module.exports = router;
