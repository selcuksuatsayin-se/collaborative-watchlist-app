import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [watchlists, setWatchlists] = useState([]);
  const [invites, setInvites] = useState([]); // YENİ STATE: Davetler için
  const [newListName, setNewListName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchData = async () => {
    try {
      // Hem listelerimi hem davetlerimi paralel çekiyoruz
      const [listsRes, invitesRes] = await Promise.all([
        axios.get("https://collaborative-watchlist-app-backend.onrender.com/api/watchlist", getAuthHeaders()),
        axios.get("https://collaborative-watchlist-app-backend.onrender.com/api/watchlist/invites/pending", getAuthHeaders()) // YENİ İSTEK
      ]);

      setWatchlists(listsRes.data);
      setInvites(invitesRes.data); // Davetleri kaydet
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) navigate("/login");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Davet Yanıtlama Fonksiyonu
  const handleInviteResponse = async (watchlistId, action) => {
    try {
      await axios.post(
        `https://collaborative-watchlist-app-backend.onrender.com/api/watchlist/${watchlistId}/respond`,
        { action }, // 'accept' veya 'decline'
        getAuthHeaders()
      );
      // Listeleri yenile (Kabul edildiyse aşağıya düşsün, reddedildiyse gitsin)
      fetchData();
      alert(action === "accept" ? "Invitation accepted!" : "Invitation declined.");
    } catch (error) {
      alert("Failed to respond.");
    }
  };

  // Create List Fonksiyonu (Aynı kalıyor)
  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    try {
      await axios.post("https://collaborative-watchlist-app-backend.onrender.com/api/watchlist", { title: newListName }, getAuthHeaders());
      setNewListName("");
      fetchData();
    } catch (error) { alert("Failed."); }
  };

  const currentUser = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="container mx-auto mt-10 px-4">
      
      {/* --- YENİ BÖLÜM: BEKLEYEN DAVETLER --- */}
      {invites.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-yellow-500 mb-4 flex items-center">
             🔔 Pending Invitations ({invites.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invites.map((invite) => (
              <div key={invite._id} className="bg-gray-800 border border-yellow-500/50 p-4 rounded-lg flex justify-between items-center shadow-lg">
                <div>
                  <h3 className="font-bold text-white text-lg">{invite.title}</h3>
                  <p className="text-sm text-gray-400">Invited by: <span className="text-white">{invite.creator.username}</span></p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleInviteResponse(invite._id, "accept")}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold text-sm transition"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleInviteResponse(invite._id, "decline")}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold text-sm transition"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MY WATCHLISTS SECTION */}
      <h1 className="text-3xl font-bold text-blue-500 mb-8">My Watchlists</h1>

      {/* CREATE FORM (Aynı) */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-10 max-w-2xl">
        <h2 className="text-xl font-semibold text-white mb-4">Create New Watchlist</h2>
        <form onSubmit={handleCreateList} className="flex gap-4">
          <input 
            type="text" 
            placeholder="e.g. Weekend Horror Marathon"
            className="flex-1 p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          />
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded transition">Create</button>
        </form>
      </div>

      {/* WATCHLISTS GRID (Aynı) */}
      {loading ? (
        <div className="text-white text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlists.length > 0 ? (
            watchlists.map((list) => {
              const isOwner = list.creator._id === currentUser?.id;
              return (
                <div key={list._id} className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 hover:border-blue-500 transition">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-white truncate">{list.title}</h3>
                    {isOwner ? (
                      <span className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded">Owner</span>
                    ) : (
                      <span className="bg-purple-900 text-purple-200 text-xs px-2 py-1 rounded">Shared</span>
                    )}
                  </div>
                  <p className="text-gray-400 mb-2">Creator: <span className="text-gray-200">{list.creator.username}</span></p>
                  <p className="text-gray-400 mb-6">Movies: <span className="text-white font-bold">{list.movies.length}</span></p>
                  <Link to={`/watchlist/${list._id}`} className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition">View Content</Link>
                </div>
              );
            })
          ) : (
            <p className="text-gray-400 col-span-full text-center">You don't have any watchlists yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;