const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/:movieId", reviewController.getMovieReviews);

router.post("/:movieId", authMiddleware, reviewController.addReview);

router.delete("/:reviewId", authMiddleware, reviewController.deleteReview);

module.exports = router;