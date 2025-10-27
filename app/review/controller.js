const { Reviews, Users, Books } = require("../Assosiation/Model");

// Create review
const addReview = async (req, res) => {
    try {
        await Reviews.sync();
        const { bookId, rating, comment } = req.body;
        const userId = req.user.id; // dari JWT login

        const review = await Reviews.create({ userId, bookId, rating, comment });
        res.json(review);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateReview = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        // 🔎 Pastikan review milik user yang login
        const review = await Reviews.findOne({
            where: { userId, bookId },
        });

        if (!review) {
            return res.status(404).json({
                message: "Ulasan anda tidak ditemukan",
            });
        }

        await review.update({ rating, comment });

        res.json({
            message: "Ulasan berhasil diperbarui.",
            review,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get reviews for a book
const getReviewsByBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        // console.log(bookId);
        const reviews = await Reviews.findAll({
            where: { bookId },
            include: [{
                model: Users,
                attributes: ["id", "userName"]
            }],
        });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get reviews for a book
const getReviewsByUser = async (req, res) => {
    try {
        const userId = req.user.id;
        // console.log(bookId);
        const reviews = await Reviews.findAll({
            where: { userId },
            include: [{
                model: Books,
                // attributes: ["id", "title"]
            }],
        });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    addReview,
    updateReview,
    getReviewsByBook,
    getReviewsByUser
}