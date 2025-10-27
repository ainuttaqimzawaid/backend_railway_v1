const express = require('express');
const router = express.Router();
const reviewController = require('./controller');
// const { police_check } = require('../../middlewares');

router.post("/reviews", reviewController.addReview);
router.put("/reviews/:bookId", reviewController.updateReview);
router.get("/reviews/user", reviewController.getReviewsByUser);
router.get("/reviews/book/:id", reviewController.getReviewsByBook);

module.exports = router;