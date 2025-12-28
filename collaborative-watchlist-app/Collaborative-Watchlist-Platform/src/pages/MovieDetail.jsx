import ReviewSection from "../components/ReviewSection";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Watchlist Ekleme State'leri
  const [showModal, setShowModal] = useState(false); // Modal açık mı?
  const [myLists, setMyLists] = useState([]); // Kullanıcının listeleri
  const [listLoading, setListLoading] = useState(false);

  // Auth Header Yardımcısı
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // 1. Film Detayını Çek
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await axios.get(`https://collaborative-watchlist-app-backend.onrender.com/api/movies/${id}`);
        setMovie(response.data);
      } catch (error) {
        console.error("Detail Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // 2. Kullanıcının Listelerini Çek (Modal açılınca çalışacak)
  const fetchMyLists = async () => {
    setListLoading(true);
    try {
      const res = await axios.get("https://collaborative-watchlist-app-backend.onrender.com/api/watchlist", getAuthHeaders());
      setMyLists(res.data);
      setShowModal(true); // Listeler gelince modali aç
    } catch (error) {
      if (error.response?.status === 401) alert("Please login to add to watchlist.");
      else alert("Failed to fetch watchlists.");
    } finally {
      setListLoading(false);
    }
  };

  // 3. Filmi Seçilen Listeye Ekle
  const handleAddToList = async (watchlistId) => {
    try {
      await axios.post(
        `https://collaborative-watchlist-app-backend.onrender.com/api/watchlist/${watchlistId}/add`,
        {
          tmdbId: movie.id,
          title: movie.title,
          posterPath: movie.poster_path
        },
        getAuthHeaders()
      );
      alert("Movie added to watchlist!");
      setShowModal(false); // Modali kapat
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add movie.");
    }
  };

  if (loading) return <div className="text-center text-white mt-20 text-2xl">Loading details...</div>;
  if (!movie) return <div className="text-center text-red-500 mt-20 text-2xl">Movie not found.</div>;

  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null;
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "https://via.placeholder.com/500x750";

  return (
    <div className="relative min-h-screen text-white pb-20">
      {/* Background */}
      {backdropUrl && (
        <div 
          className="fixed inset-0 bg-cover bg-center opacity-20 -z-10"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        ></div>
      )}

      <div className="relative container mx-auto p-6 mt-10">
        <Link to="/" className="text-blue-400 hover:underline mb-6 inline-block">← Back to Home</Link>
        
        <div className="flex flex-col md:flex-row gap-10 bg-gray-900/80 p-8 rounded-xl shadow-2xl backdrop-blur-sm">
          <img src={posterUrl} alt={movie.title} className="w-72 rounded-lg shadow-lg border border-gray-700 mx-auto md:mx-0"/>

          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2 text-blue-500">{movie.title}</h1>
            <p className="text-gray-400 italic mb-4">{movie.tagline}</p>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-green-600 px-3 py-1 rounded font-bold">★ {movie.vote_average?.toFixed(1)}</span>
              <span className="text-gray-300">{movie.release_date?.split("-")[0]}</span>
              <span className="text-gray-300">{movie.runtime} min</span>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {movie.genres?.map(g => (
                <span key={g.id} className="bg-gray-700 text-sm px-3 py-1 rounded-full text-blue-200 border border-blue-500/30">
                  {g.name}
                </span>
              ))}
            </div>

            <h3 className="text-xl font-semibold mb-2 text-gray-200">Overview</h3>
            <p className="text-gray-300 leading-relaxed mb-8">{movie.overview}</p>

            {/* Aksiyon Butonları */}
            <div className="flex gap-4">
              <button 
                onClick={fetchMyLists}
                disabled={listLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                {listLoading ? "Loading..." : "+ Add to Watchlist"}
              </button>
              
              {movie.homepage && (
                <a href={movie.homepage} target="_blank" rel="noopener noreferrer" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition">
                  Visit Homepage
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL: SELECT WATCHLIST --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md border border-gray-700 shadow-2xl relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
            >✕</button>
            
            <h3 className="text-xl font-bold text-white mb-4">Select a Watchlist</h3>
            
            {myLists.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {myLists.map(list => (
                  <button
                    key={list._id}
                    onClick={() => handleAddToList(list._id)}
                    className="w-full text-left p-3 rounded bg-gray-700 hover:bg-blue-600 hover:text-white transition flex justify-between items-center group"
                  >
                    <span className="font-medium">{list.title}</span>
                    <span className="text-xs text-gray-400 group-hover:text-blue-200">
                      {list.movies.length} items
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-4">You don't have any watchlists yet.</p>
                <Link to="/dashboard" className="text-blue-400 hover:underline">Create one in Dashboard</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- REVIEW SECTION --- */}
      <div className="relative container mx-auto px-6 pb-20">
         <ReviewSection movieId={id} movieTitle={movie.title} />
      </div>

    </div>
  );
};

export default MovieDetail;