const express = require("express");
const router = express.Router();
const moviesController = require("../controllers/moviesController");

router.get("/popular", moviesController.getPopularMovies);
router.get("/search", moviesController.searchMovies);
router.get("/genres", moviesController.getGenres);
router.get("/:id", moviesController.getMovieDetails);

module.exports = router;