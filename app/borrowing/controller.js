// controllers/borrowing/controller.js
const { Books, Borrowings, sequelize } = require('../Assosiation/Model'); // sesuaikan path
const { Op } = require('sequelize');

const BORROW_DAYS = 7;

const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};

// POST /api/borrowings
const borrowBook = async (req, res) => {
    const { userId, bookId } = req.body;
    // await Borrowings.sync();
    if (!userId || !bookId) return res.status(400).json({ message: 'userId and bookId are required' });

    const t = await sequelize.transaction();
    try {
        const book = await Books.findByPk(bookId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!book) {
            await t.rollback();
            return res.status(404).json({ message: 'Book not found' });
        }

        // Jika tersedia -> buat borrowing
        if (book.availableCopies > 0) {
            const startDate = new Date();
            const endDate = addDays(startDate, BORROW_DAYS);

            const borrowing = await Borrowings.create({
                userId,
                bookId,
                startDate,
                endDate,
                status: 'borrowed'
            }, { transaction: t });

            // Ambil ulang borrowing beserta relasi Book
            const borrowingWithBook = await Borrowings.findByPk(borrowing.id, {
                include: [{ model: Books }],
                transaction: t
            });

            await book.update({ availableCopies: book.availableCopies - 1 }, { transaction: t });

            await t.commit();
            return res.status(201).json({ message: 'Book borrowed', borrowing: borrowingWithBook });
        } else {
            // Jika kosong -> sarankan antrean atau langsung enqueue (pilihan: otomatis enqueue)
            // Di sini kita return 200 + info bahwa stok habis; frontend bisa panggil /api/queues
            await t.rollback();
            return res.status(200).json({ message: 'Book currently unavailable. You can join the queue' });
        }
    } catch (err) {
        if (t) await t.rollback();
        console.error(err);
        return res.status(500).json({ message: err.message || 'Internal server error' });
    }
};

// PUT /api/borrowings/return/:id
const returnBook = async (req, res) => {
    const { id } = req.params; // borrowing id
    const userId = req.user.id;
    const t = await sequelize.transaction();
    try {
        const borrowing = await Borrowings.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
        if (!borrowing) {
            await t.rollback();
            return res.status(404).json({ message: 'Borrowing not found' });
        }

        // 🔒 Cek apakah borrowing ini milik user yang login
        if (borrowing.userId !== userId) {
            await t.rollback();
            return res.status(403).json({ message: "You are not allowed to return this book" });
        }

        if (borrowing.status === 'returned') {
            await t.rollback();
            return res.status(400).json({ message: 'This borrowing is already returned' });
        }

        // tandai returned
        borrowing.status = 'returned';
        await borrowing.save({ transaction: t });

        // tambah availableCopies & readCount di table books
        const book = await Books.findByPk(borrowing.bookId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!book) {
            // unlikely
            await t.rollback();
            return res.status(404).json({ message: 'Related book not found' });
        }

        await book.update({
            availableCopies: book.availableCopies + 1,
            readCount: book.readCount + 1
        }, { transaction: t });

        await t.commit();
        return res.json({ message: "Book returned successfully", borrowing });

    } catch (err) {
        if (t) await t.rollback();
        console.error(err);
        return res.status(500).json({ message: err.message || 'Internal server error' });
    }
};

// Pinjaman yang masih aktif
const indexActive = async (req, res) => {
    try {
        const borrowings = await Borrowings.findAll({
            where: { userId: req.user.id, status: 'borrowed' },
            include: [{ model: Books }],
            order: [['createdAt', 'DESC']],
        });
        return res.json(borrowings);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Pinjaman yang sudah dikembalikan
const indexHistory = async (req, res) => {
    try {
        const borrowings = await Borrowings.findAll({
            where: { userId: req.user.id, status: 'returned' },
            include: [{ model: Books }],
            order: [['createdAt', 'DESC']],
        });
        return res.json(borrowings);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


module.exports = {
    borrowBook,
    indexActive,
    indexHistory,
    returnBook,
}