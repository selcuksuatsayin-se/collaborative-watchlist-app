const express = require("express");
const router = express.Router();
const watchlistController = require("../controllers/watchlistController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, watchlistController.createWatchlist);

router.get("/", authMiddleware, watchlistController.getMyWatchlists);

router.post("/:watchlistId/add", authMiddleware, watchlistController.addMovieToWatchlist);

router.delete("/:watchlistId/remove/:movieId", authMiddleware, watchlistController.removeMovieFromWatchlist);

router.post("/:watchlistId/invite", authMiddleware, watchlistController.inviteUserToWatchlist);

router.get("/invites/pending", authMiddleware, watchlistController.getPendingInvites);

router.post("/:watchlistId/respond", authMiddleware, watchlistController.respondToInvite);

module.exports = router;