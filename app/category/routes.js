const router = require('express').Router();
const categoryController = require('./controller');

router.post('/category', categoryController.store );

module.exports = router;