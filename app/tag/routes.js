const router = require('express').Router();
const tagController = require('./controller');
const { police_check } = require('../../middlewares');

router.get('/tag',
    tagController.index
);
router.get('/tag/:id',
    tagController.view
);
router.post('/tag',
    police_check('create', 'Books'),
    tagController.store
);
router.put('/tag/:id',
    police_check('update', 'Books'),
    tagController.update
);
router.delete('/tag/:id',
    police_check('delete', 'Books'),
    tagController.destroy
);

module.exports = router;