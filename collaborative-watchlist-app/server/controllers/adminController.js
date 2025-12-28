const User = require("../models/User");
const Review = require("../models/Review");

exports.getStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const reviewCount = await Review.countDocuments();
    res.status(200).json({ userCount, reviewCount });
  } catch (error) {
    res.status(500).json({ message: "Statistics can not be retrieved." });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Reviews could not be retrieved." });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Review deleted by admin." });
  } catch (error) {
    res.status(500).json({ message: "Deletion failed." });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Users could not be retrieved." });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User banned/deleted." });
  } catch (error) {
    res.status(500).json({ message: "User deletion failed." });
  }
};