const router = require('express').Router();
const tagController = require('./controller');

router.get('/tag', tagController.index);
router.get('/tag/:id', tagController.view);
router.post('/tag', tagController.store);
router.put('/tag/:id', tagController.update);
router.delete('/tag/:id', tagController.destroy);

module.exports = router;