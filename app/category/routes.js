const router = require('express').Router();
const { police_check } = require('../../middlewares');
const categoryController = require('./controller');

router.get('/category',
    categoryController.index
);
router.get('/category/:id',
    categoryController.view
);
router.post('/category',
    police_check('create', 'Books'),
    categoryController.store
);
router.put('/category/:id',
    police_check('update', 'Books'),
    categoryController.update
);
router.delete('/category/:id',
    police_check('delete', 'Books'),
    categoryController.destroy
);

module.exports = router;