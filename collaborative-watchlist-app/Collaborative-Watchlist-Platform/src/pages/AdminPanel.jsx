import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify"; // Toast Import
import ConfirmModal from "../components/ConfirmModal"; // Modal Import

const AdminPanel = () => {
  const [stats, setStats] = useState({ userCount: 0, reviewCount: 0 });
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("reviews"); 
  const navigate = useNavigate();

  // Modal State'leri
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null); // 'deleteReview' or 'banUser'
  const [selectedId, setSelectedId] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchData = async () => {
    try {
      const [statsRes, reviewsRes, usersRes] = await Promise.all([
        axios.get("https://collaborative-watchlist-app-backend.onrender.com/api/admin/stats", getAuthHeaders()),
        axios.get("https://collaborative-watchlist-app-backend.onrender.com/api/admin/reviews", getAuthHeaders()),
        axios.get("https://collaborative-watchlist-app-backend.onrender.com/api/admin/users", getAuthHeaders())
      ]);

      setStats(statsRes.data);
      setReviews(reviewsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error("Admin Access Error:", error);
      toast.error("Access Denied: You are not an admin.");
      navigate("/");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- MODAL TETİKLEYİCİLER ---
  const confirmDeleteReview = (id) => {
    setSelectedId(id);
    setModalAction("deleteReview");
    setModalOpen(true);
  };

  const confirmBanUser = (id) => {
    setSelectedId(id);
    setModalAction("banUser");
    setModalOpen(true);
  };

  // --- İŞLEMİ ONAYLA VE YAP (Render URL) ---
  const handleConfirmAction = async () => {
    try {
      if (modalAction === "deleteReview") {
        await axios.delete(
            `https://collaborative-watchlist-app-backend.onrender.com/api/admin/review/${selectedId}`, 
            getAuthHeaders()
        );
        setReviews(reviews.filter(r => r._id !== selectedId));
        toast.success("Review deleted successfully.");
      } 
      else if (modalAction === "banUser") {
        await axios.delete(
            `https://collaborative-watchlist-app-backend.onrender.com/api/admin/user/${selectedId}`, 
            getAuthHeaders()
        );
        setUsers(users.filter(u => u._id !== selectedId));
        toast.success("User banned successfully.");
      }
    } catch (error) {
      toast.error("Action failed.");
    } finally {
      setModalOpen(false); // Modalı kapat
    }
  };

  return (
    <div className="container mx-auto mt-10 px-4 pb-20">
      <h1 className="text-3xl font-bold text-red-500 mb-6">🛡️ Admin Moderation Panel</h1>
      
      {/* STATS CARDS */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg text-center border border-gray-700">
          <h3 className="text-gray-400">Total Users</h3>
          <p className="text-4xl font-bold text-white">{stats.userCount}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg text-center border border-gray-700">
          <h3 className="text-gray-400">Total Reviews</h3>
          <p className="text-4xl font-bold text-white">{stats.reviewCount}</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 mb-6 border-b border-gray-700 pb-2">
        <button 
          onClick={() => setActiveTab("reviews")}
          className={`px-4 py-2 font-bold ${activeTab === "reviews" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-400"}`}
        >
          Content Moderation (Reviews)
        </button>
        <button 
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 font-bold ${activeTab === "users" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-400"}`}
        >
          User Moderation (Users)
        </button>
      </div>

      {/* CONTENT: REVIEWS */}
      {activeTab === "reviews" && (
        <div className="space-y-4">
          {reviews.map(rev => (
            <div key={rev._id} className="bg-gray-800 p-4 rounded border border-gray-700 flex justify-between items-start">
              <div className="flex-1">
                <p className="text-yellow-500 font-bold mb-1">
                  ★ {rev.rating} 
                  <span className="text-gray-400 text-sm ml-2">by {rev.user?.username || "Unknown"}</span>
                </p>
                
                {/* Film Başlığı ve Linki */}
                <p className="text-blue-400 text-sm font-semibold mb-2 flex items-center gap-2">
                  Movie: 
                  <Link to={`/movie/${rev.tmdbId}`} target="_blank" className="hover:underline flex items-center gap-1">
                      {rev.movieTitle || `ID: ${rev.tmdbId}`} 
                      <span className="text-xs text-gray-500">↗</span>
                  </Link>
                </p>

                <p className="text-gray-200 italic">"{rev.comment}"</p>
              </div>
              
              <button 
                onClick={() => confirmDeleteReview(rev._id)}
                className="ml-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold whitespace-nowrap"
              >
                Delete Content
              </button>
            </div>
          ))}
        </div>
      )}

      {/* CONTENT: USERS */}
      {activeTab === "users" && (
        <div className="space-y-2">
          {users.map(u => (
            <div key={u._id} className="bg-gray-800 p-4 rounded border border-gray-700 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">{u.username} <span className="text-xs text-gray-400">({u.role})</span></p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </div>
              {u.role !== "admin" && (
                <button 
                  onClick={() => confirmBanUser(u._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold"
                >
                  Ban User
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --- CONFIRMATION MODAL --- */}
      <ConfirmModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={modalAction === "deleteReview" ? "Delete Content?" : "Ban User?"}
        message={modalAction === "deleteReview" ? "Are you sure you want to remove this review permanently?" : "Are you sure you want to ban this user permanently? They will lose access immediately."}
        isDanger={true}
      />
    </div>
  );
};

export default AdminPanel;