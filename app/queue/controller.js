// controllers/queue/controller.js
const { Books, Queues, Borrowings, sequelize, Users } = require('../Assosiation/Model'); // sesuaikan path
const { Op } = require('sequelize');

const store = async (req, res) => {
    const { bookId } = req.body;
    const userId = req.user.id;
    // console.log('Adding to queue for book:', bookId, 'by user:', userId);
    // await Queues.sync();
    if (!userId || !bookId) return res.status(400).json({ message: 'userId and bookId are required' });

    try {
        const book = await Books.findByPk(bookId);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        // Jika buku tersedia, sarankan meminjam langsung
        if (book.availableCopies > 0) {
            return res.status(400).json({ message: 'Book is available. You can borrow directly.' });
        }

        // Cek apakah user sudah ada di antrean untuk book ini
        const existing = await Queues.findOne({
            where: { userId, bookId, status: 'waiting' }
        });
        if (existing) {
            return res.status(400).json({ message: 'You are already in queue for this book' });
        }

        const queue = await Queues.create({ userId, bookId, status: 'waiting' });
        const queueWithBook = await Queues.findByPk(queue.id, {
            include: [{ model: Books }]
        });
        return res.status(201).json({ message: 'Added to queue', queue: queueWithBook });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message || 'Internal server error' });
    }
};

// GET /api/queues/:bookId
const index = async (req, res) => {
    const userId = req.user.id;
    try {
        const queues = await Queues.findAll({
            where: { userId, status: 'waiting' },
            order: [['createdAt', 'ASC']],
            include: [{ model: Books }],
            // include: typeof Users !== 'undefined' ? [{ model: Users }] : []
        });
        return res.json(queues);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message || 'Internal server error' });
    }
};

// PUT /api/queues/cancel/:id
const destroy = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const queue = await Queues.findByPk(id);
        if (!userId || !queue) return res.status(400).json({ message: 'userId and queue are required' });
        if (!queue) return res.status(404).json({ message: 'Queue item not found' });

        Queues.destroy({ where: { id } });
        return res.json({ queue, message: 'Queue cancelled' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message || 'Internal server error' });
    }
};

/**
 * Optional admin endpoint to assign next user in queue automatically:
 * POST /api/queues/process/:bookId
 * - If there's availableCopies > 0 and there's a waiting queue, this endpoint
 *   will create a Borrowing for the first waiting user and decrement availableCopies.
 */
const processNextInQueue = async (req, res) => {
    const { bookId } = req.params;
    const t = await sequelize.transaction();
    try {
        const book = await Books.findByPk(bookId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!book) {
            await t.rollback();
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.availableCopies <= 0) {
            await t.rollback();
            return res.status(400).json({ message: 'No available copies to assign' });
        }

        const nextQueue = await Queues.findOne({
            where: { bookId, status: 'waiting' },
            order: [['createdAt', 'ASC']],
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!nextQueue) {
            await t.rollback();
            return res.status(404).json({ message: 'No waiting queue' });
        }

        // create borrowing for nextQueue.userId
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 7);

        const borrowing = await Borrowings.create({
            userId: nextQueue.userId,
            bookId: book.id,
            startDate,
            endDate,
            status: 'borrowed'
        }, { transaction: t });

        // decrement availableCopies
        await book.update({ availableCopies: book.availableCopies - 1 }, { transaction: t });

        // update queue status -> removed or notified/processed
        await nextQueue.update({ status: 'notified' }, { transaction: t });

        await t.commit();
        return res.json({ message: 'Assigned book to next user in queue', borrowing, nextQueue });
    } catch (err) {
        if (t) await t.rollback();
        console.error(err);
        return res.status(500).json({ message: err.message || 'Internal server error' });
    }
};

module.exports = {
    store,
    index,
    destroy,
    processNextInQueue
}