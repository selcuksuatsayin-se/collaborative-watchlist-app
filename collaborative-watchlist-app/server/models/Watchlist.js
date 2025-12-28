const mongoose = require("mongoose");

const WatchlistSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  collaborators: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],
  pendingInvites: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],
  title: {
    type: String,
    required: true,
  },
  movies: [
    {
      tmdbId: { type: String, required: true },
      title: String,
      posterPath: String,
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      addedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Watchlist", WatchlistSchema);