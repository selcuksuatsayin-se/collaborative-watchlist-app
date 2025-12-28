const Review = require("../models/Review");

exports.addReview = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { rating, comment, movieTitle } = req.body; 

    if (!rating || !comment || !movieTitle) {
      return res.status(400).json({ message: "Point, comment and movie title are required." });
    }

    const newReview = new Review({
      user: req.user.id,
      tmdbId: movieId,
      movieTitle: movieTitle,
      rating,
      comment
    });

    await newReview.save();
    const populatedReview = await newReview.populate("user", "username");

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: "Review could not be added." });
  }
};

exports.getMovieReviews = async (req, res) => {
  try {
    const { movieId } = req.params;

    const reviews = await Review.find({ tmdbId: movieId })
      .populate("user", "username")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Reviews could not be retrieved." });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found." });

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to delete this review." });
    }

    await review.deleteOne();
    res.status(200).json({ message: "Review deleted." });
  } catch (error) {
    res.status(500).json({ message: "Delete process failed." });
  }
};