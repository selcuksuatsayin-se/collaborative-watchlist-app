import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Toast Import
import ConfirmModal from "../components/ConfirmModal"; // Modal Import

const Dashboard = () => {
  const [watchlists, setWatchlists] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Modal State'leri (Create)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  
  // Silme İşlemi için State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // VERİ ÇEKME (Render URL)
  const fetchData = async () => {
    try {
      const [listsRes, invitesRes] = await Promise.all([
        axios.get("https://collaborative-watchlist-app-backend.onrender.com/api/watchlist", getAuthHeaders()),
        axios.get("https://collaborative-watchlist-app-backend.onrender.com/api/watchlist/invites/pending", getAuthHeaders())
      ]);
      setWatchlists(listsRes.data);
      setInvites(invitesRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) navigate("/login");
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- CREATE WATCHLIST (Render URL) ---
  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return toast.warning("Please enter a name");
    
    try {
      await axios.post(
        "https://collaborative-watchlist-app-backend.onrender.com/api/watchlist", 
        { title: newListName }, 
        getAuthHeaders()
      );
      toast.success("Watchlist created!");
      setNewListName("");
      setShowCreateModal(false); // Modalı kapat
      fetchData();
    } catch (error) { 
      toast.error("Failed to create watchlist"); 
    }
  };

  // --- DELETE WATCHLIST (Modal Tetikleyici) ---
  const openDeleteModal = (id) => {
    setSelectedListId(id);
    setDeleteModalOpen(true);
  };

  // --- DELETE WATCHLIST (İşlem - Render URL) ---
  const handleDeleteList = async () => {
    try {
      await axios.delete(
        `https://collaborative-watchlist-app-backend.onrender.com/api/watchlist/${selectedListId}`, 
        getAuthHeaders()
      );
      toast.success("Watchlist deleted.");
      setDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to delete watchlist.");
    }
  };

  // --- INVITE RESPONSE (Render URL) ---
  const handleInviteResponse = async (id, action) => {
    try {
      await axios.post(
        `https://collaborative-watchlist-app-backend.onrender.com/api/watchlist/${id}/respond`, 
        { action }, 
        getAuthHeaders()
      );
      fetchData();
      toast.success(action === 'accept' ? "Invitation Accepted!" : "Invitation Declined");
    } catch (error) { 
      toast.error("Error responding invite"); 
    }
  };

  const currentUser = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="container mx-auto mt-10 px-4 pb-20">
      
      {/* HEADER & CREATE BUTTON */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-500">My Watchlists</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 transition"
        >
          <span className="text-xl">+</span> New List
        </button>
      </div>

      {/* PENDING INVITES */}
      {invites.length > 0 && (
        <div className="mb-10 bg-yellow-900/20 border border-yellow-600/50 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-yellow-500 mb-4">🔔 Pending Invitations</h2>
          <div className="grid gap-4">
            {invites.map((invite) => (
              <div key={invite._id} className="bg-gray-800 p-4 rounded flex justify-between items-center">
                <span>Invited to <b>{invite.title}</b> by {invite.creator.username}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleInviteResponse(invite._id, "accept")} className="bg-green-600 px-3 py-1 rounded text-sm font-bold">Accept</button>
                  <button onClick={() => handleInviteResponse(invite._id, "decline")} className="bg-red-600 px-3 py-1 rounded text-sm font-bold">Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WATCHLISTS GRID */}
      {loading ? (
        <div className="text-white text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlists.length > 0 ? (
            watchlists.map((list) => {
             const isOwner = list.creator._id === currentUser?.id;
             return (
              <div key={list._id} className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 relative group hover:border-blue-500 transition">
                {/* DELETE BUTTON (Sadece Owner Görür) */}
                {isOwner && (
                  <button 
                    onClick={() => openDeleteModal(list._id)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition p-1"
                    title="Delete List"
                  >
                    🗑️
                  </button>
                )}

                <div className="mb-4 pr-6">
                    <h3 className="text-2xl font-bold text-white truncate">{list.title}</h3>
                    <div className="mt-2">
                        {isOwner ? (
                            <span className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded">Owner</span>
                        ) : (
                            <span className="bg-purple-900 text-purple-200 text-xs px-2 py-1 rounded">Shared</span>
                        )}
                    </div>
                </div>
                
                <p className="text-gray-400 mb-1">Creator: <span className="text-gray-200">{list.creator.username}</span></p>
                <p className="text-gray-400 mb-6">Movies: <span className="text-white font-bold">{list.movies.length}</span></p>

                <Link to={`/watchlist/${list._id}`} className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition">
                  View Content
                </Link>
              </div>
             );
          })
          ) : (
            <p className="text-gray-400 col-span-full text-center">You don't have any watchlists yet.</p>
          )}
        </div>
      )}

      {/* --- CREATE MODAL --- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md border border-gray-600 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Create New Watchlist</h2>
            <form onSubmit={handleCreateList}>
              <input 
                autoFocus
                type="text" 
                placeholder="List Name (e.g. Action Favs)"
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-500 mb-4 focus:outline-none focus:border-blue-500"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-300 hover:text-white transition">Cancel</button>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold transition">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteList}
        title="Delete Watchlist?"
        message="Are you sure you want to delete this watchlist? This action cannot be undone."
        isDanger={true}
      />

    </div>
  );
};

export default Dashboard;