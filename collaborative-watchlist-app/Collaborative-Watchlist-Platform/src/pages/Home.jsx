import { useState, useEffect } from "react";
import axios from "axios";
import MovieCard from "../components/MovieCard";
import { Link } from "react-router-dom";

const Home = () => {
  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ARAMA STATE'LERİ
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  
  // SAYFALAMA STATE'İ (YENİ)
  const [page, setPage] = useState(1);

  // Filmleri Çek
  const fetchMovies = async (currentPage) => {
    setLoading(true);
    try {
      let url = "https://collaborative-watchlist-app-backend.onrender.com/api/movies/popular";
      let params = { page: currentPage }; // Sayfa numarasını gönderiyoruz

      // Filtre varsa endpoint değişir
      if (query || selectedGenre || selectedYear || selectedRating) {
        url = "https://collaborative-watchlist-app-backend.onrender.com/api/movies/search";
        params = {
          ...params, // page parametresini koru
          query: query,
          genre: selectedGenre,
          year: selectedYear,
          rating: selectedRating
        };
      }

      const response = await axios.get(url, { params });
      setMovies(response.data);
    } catch (err) {
      console.error("Error fetching movies:", err);
    } finally {
      setLoading(false);
    }
  };

  // İlk Yükleme
  useEffect(() => {
    const getGenres = async () => {
      try {
        const res = await axios.get("https://collaborative-watchlist-app-backend.onrender.com/api/movies/genres");
        setGenres(res.data);
      } catch (error) { console.error("Genres fetch error", error); }
    };
    getGenres();
  }, []);

  // Sayfa (Page) Değişince Çalışır
  useEffect(() => {
    fetchMovies(page);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sayfa değişince yukarı kaydır
  }, [page]); // page değiştiğinde tetiklenir

  // Arama Butonuna Basınca
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Yeni aramada sayfayı 1'e sıfırla
    fetchMovies(1);
  };

  // Temizle
  const handleClear = () => {
    setQuery("");
    setSelectedGenre("");
    setSelectedYear("");
    setSelectedRating("");
    setPage(1);
    window.location.reload(); 
  };

  return (
    <div className="container mx-auto mt-10 px-4 pb-20">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-500 mb-4">Movie Discovery</h1>
        {user && <p className="text-xl text-gray-300">Welcome, {user.username}!</p>}
      </div>

      {/* SEARCH BAR */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-10 border border-gray-700">
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              type="text"
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="Search by title (e.g. Godfather)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              className="p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              <option value="">All Genres</option>
              {genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>

            <input
              type="number"
              placeholder="Year (e.g. 2023)"
              className="p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              min="1900" max="2030"
            />

            <select
              className="p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none"
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
            >
              <option value="">All Ratings</option>
              <option value="8">8+ (Excellent)</option>
              <option value="7">7+ (Good)</option>
              <option value="6">6+ (Decent)</option>
            </select>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition">Search</button>
              <button type="button" onClick={handleClear} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded transition">Clear</button>
            </div>
          </div>
        </form>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-center text-white text-2xl animate-pulse">Loading movies...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
            {movies.length > 0 ? (
              movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)
            ) : (
              <div className="col-span-full text-center text-gray-400 text-xl py-10">
                No movies found.
              </div>
            )}
          </div>

          {/* --- PAGINATION BUTTONS (YENİ) --- */}
          {movies.length > 0 && (
            <div className="flex justify-center items-center gap-4">
              <button 
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              
              <span className="text-xl font-bold text-blue-400">Page {page}</span>

              <button 
                onClick={() => setPage(prev => prev + 1)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;