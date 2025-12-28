import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify"; // Toast import edildi
import ConfirmModal from "../components/ConfirmModal"; // Modal import edildi

const WatchlistPage = () => {
  const { id } = useParams(); // URL'den watchlist ID'sini al
  const [watchlist, setWatchlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  
  // MODAL STATE'LERİ (YENİ)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);

  // Token'ı al
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // Listeyi Getir
  const fetchWatchlist = async () => {
    try {
      const res = await axios.get(`https://collaborative-watchlist-app-backend.onrender.com/api/watchlist`, getAuthHeaders());
      const currentList = res.data.find(list => list._id === id);
      setWatchlist(currentList);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, [id]);

  // Arkadaş Davet Et (Toast ile Güncellendi)
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return toast.warning("Please enter an email address.");

    try {
      await axios.post(
        `https://collaborative-watchlist-app-backend.onrender.com/api/watchlist/${id}/invite`,
        { email: inviteEmail },
        getAuthHeaders()
      );
      toast.success("User invited successfully!"); // Mesaj yerine Toast
      setInviteEmail("");
      fetchWatchlist(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to invite user."); // Hata mesajı Toast
    }
  };

  // Film Silme - Adım 1: Modalı Aç
  const confirmRemoveMovie = (movieId) => {
    setMovieToDelete(movieId);
    setIsDeleteModalOpen(true);
  };

  // Film Silme - Adım 2: İşlemi Gerçekleştir (Modal Onaylayınca Çalışır)
  const handleRemoveMovie = async () => {
    try {
      await axios.delete(
        `https://collaborative-watchlist-app-backend.onrender.com/api/watchlist/${id}/remove/${movieToDelete}`,
        getAuthHeaders()
      );
      
      // State'i güncelle (Sayfayı yenilemeden filmi ekrandan sil)
      setWatchlist(prev => ({
        ...prev,
        movies: prev.movies.filter(m => m.tmdbId !== movieToDelete)
      }));
      
      toast.success("Movie removed from list.");
      setIsDeleteModalOpen(false); // Modalı kapat
    } catch (error) {
      toast.error("Failed to remove movie.");
    }
  };

  if (loading) return <div className="text-white text-center mt-10">Loading...</div>;
  if (!watchlist) return <div className="text-red-500 text-center mt-10">Watchlist not found or access denied.</div>;

  return (
    <div className="container mx-auto mt-10 px-4 pb-20">
      <Link to="/dashboard" className="text-blue-400 hover:underline mb-4 inline-block">← Back to Dashboard</Link>
      
      {/* Header */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-2">{watchlist.title}</h1>
        <p className="text-gray-400">Created by: <span className="text-blue-300">{watchlist.creator.username}</span></p>
        
        {/* Collaborators Section */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 uppercase mb-2">Collaborators</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {watchlist.collaborators.length > 0 ? (
              watchlist.collaborators.map(u => (
                <span key={u._id} className="bg-purple-900 text-purple-200 text-xs px-2 py-1 rounded">
                  {u.username}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No collaborators yet.</span>
            )}
          </div>

          {/* Invite Form */}
          <form onSubmit={handleInvite} className="flex gap-2 max-w-md">
            <input 
              type="email" 
              placeholder="Enter friend's email to invite"
              className="flex-1 p-2 rounded bg-gray-700 text-white text-sm border border-gray-600 focus:outline-none focus:border-blue-500"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              // required özelliği kaldırıldı, kontrolü handleInvite içinde yapıyoruz
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded transition font-bold">
              Invite
            </button>
          </form>
        </div>
      </div>

      {/* Movies Grid */}
      <h2 className="text-2xl font-bold text-white mb-6">Movies in this List ({watchlist.movies.length})</h2>
      
      {watchlist.movies.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {watchlist.movies.map((movie) => (
            <div key={movie.tmdbId} className="bg-gray-800 rounded-lg overflow-hidden shadow group relative border border-gray-700">
              <Link to={`/movie/${movie.tmdbId}`}>
                <img 
                  src={movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : "https://via.placeholder.com/500x750"} 
                  alt={movie.title}
                  className="w-full h-64 object-cover opacity-80 group-hover:opacity-100 transition"
                />
              </Link>
              
              {/* REMOVE BUTTON (Modal Tetikler) */}
              <button 
                onClick={() => confirmRemoveMovie(movie.tmdbId)}
                className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-700"
                title="Remove from list"
              >
                ✕
              </button>

              <div className="p-3">
                <h3 className="text-white text-sm font-bold truncate">{movie.title}</h3>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
          <p className="text-gray-400 text-lg">This list is empty.</p>
          <Link to="/" className="text-blue-400 hover:underline mt-2 inline-block">Go discover movies to add!</Link>
        </div>
      )}

      {/* --- CONFIRMATION MODAL (YENİ EKLENDİ) --- */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleRemoveMovie}
        title="Remove Movie?"
        message="Are you sure you want to remove this movie from the watchlist?"
        isDanger={true}
      />
    </div>
  );
};

export default WatchlistPage;