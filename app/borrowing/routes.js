const express = require('express');
const router = express.Router();
const borrowingController = require('./controller');
const { police_check } = require('../../middlewares');

router.get('/borrowings/active',
    police_check('read', 'Borrowing'),
    borrowingController.indexActive
);

router.get('/borrowings/history',
    police_check('read', 'Borrowing'),
    borrowingController.indexHistory
);

router.post('/borrowbook',
    police_check('create', 'Borrowing'),
    borrowingController.borrowBook
);

router.put('/returnbook/:id',
    police_check('update', 'Borrowing'),
    borrowingController.returnBook
);

module.exports = router;
