const express = require('express');
const router = express.Router();
const queueController = require('./controller');
const { police_check } = require('../../middlewares');

// Tambahkan antrean untuk buku tertentu
router.post('/queue',
    police_check('create', 'Queue'),
    queueController.store);

// Ambil semua antrean user
router.get('/queue',
    police_check('read', 'Queue'),
    queueController.index);

// Ambil antrean buku tertentu
router.delete('/queue/:id',
    police_check('delete', 'Queue'),
    queueController.destroy);

// Hapus antrean (misal user sudah dipinjamkan)
router.delete('/queue/:idddd', queueController.processNextInQueue);

module.exports = router;
