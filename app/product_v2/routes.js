const router = require('express').Router();
const bookController = require('./controller');
const multer = require('multer');
const { police_check } = require('../../middlewares');

// gunakan memoryStorage, bukan os.tmpdir()
const upload = multer({ storage: multer.memoryStorage() });

router.get('/book', bookController.index);
router.get('/book/favorite', bookController.favorite);
router.get('/book/new-arrival', bookController.newArrival);
router.get('/book/new-release', bookController.newRelease);
router.get('/book/:id', bookController.view);

router.post(
    '/book',
    upload.single('image'),
    police_check('create', 'Books'),
    bookController.store
);

router.put(
    '/book/:id',
    upload.single('image'),
    police_check('update', 'Books'),
    bookController.update
);

router.delete(
    '/book/:id',
    // police_check('delete', 'Books'),
    bookController.destroy
);

module.exports = router;
