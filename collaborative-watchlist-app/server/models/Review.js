const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  tmdbId: { type: String, required: true },
  movieTitle: { 
    type: String, 
    required: true 
  },
  rating: { type: Number, required: true, min: 1, max: 10 },
  comment: { type: String, required: true, maxlength: 500 }
}, { timestamps: true });

module.exports = mongoose.model("Review", ReviewSchema);