const axios = require("axios");

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

exports.getPopularMovies = async (req, res) => {
  const { page } = req.query;

  try {
    const response = await axios.get(`${BASE_URL}/movie/popular`, {
      params: {
        api_key: API_KEY,
        language: "en-US",
        page: page || 1
      }
    });
    res.status(200).json(response.data.results);
  } catch (error) {
    console.error("Popular Movies Error:", error.message);
    res.status(500).json({ message: "Could not fetch popular movies." });
  }
};

exports.searchMovies = async (req, res) => {
  const { query, genre, year, rating, page } = req.query;
  
  console.log(`🔍 Arama: Page=${page}, Query=${query}, Genre=${genre}, Year=${year}, Rating=${rating}`);

  let targetUrl = "";
  let params = {
    api_key: API_KEY,
    language: "en-US",
    include_adult: false,
    page: page || 1
  };

  try {
    if (query && query.trim() !== "") {
      targetUrl = `${BASE_URL}/search/movie`;
      params.query = query;
      if (year) params.primary_release_year = year;
    } 
    else {
      targetUrl = `${BASE_URL}/discover/movie`;
      if (genre) params.with_genres = genre;
      if (year) params.primary_release_year = year;
      
      if (rating) {
        params["vote_average.gte"] = rating;
        params["vote_count.gte"] = 2000; 
      } else {
        params["vote_count.gte"] = 100;
      }
      
      params.sort_by = "popularity.desc";
    }

    const response = await axios.get(targetUrl, { params });
    res.status(200).json(response.data.results);

  } catch (error) {
    console.error("Search Error:", error.message);
    res.status(500).json({ message: "Search error occurred." });
  }
};

exports.getGenres = async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/genre/movie/list`, {
      params: {
        api_key: API_KEY,
        language: "en-US"
      }
    });
    res.status(200).json(response.data.genres);
  } catch (error) {
    console.error("Genre Error:", error.message);
    res.status(500).json({ message: "Could not fetch genres." });
  }
};

exports.getMovieDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.get(`${BASE_URL}/movie/${id}`, {
      params: {
        api_key: API_KEY,
        language: "en-US"
      }
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(404).json({ message: "Movie not found." });
  }
};