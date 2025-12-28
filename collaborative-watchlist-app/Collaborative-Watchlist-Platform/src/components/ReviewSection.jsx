import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ReviewSection = ({ movieId, movieTitle }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(10);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`https://collaborative-watchlist-app-backend.onrender.com/api/reviews/${movieId}`);
      setReviews(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching reviews", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [movieId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Please login to post a review.");

    if (!comment.trim()) {
      return toast.warning("Please enter a comment!");
    }

    if (!movieTitle) {
      return toast.error("Movie title information is missing. Please refresh the page.");
    }

    try {
      await axios.post(
        `https://collaborative-watchlist-app-backend.onrender.com/api/reviews/${movieId}`,
        { 
          rating, 
          comment, 
          movieTitle: movieTitle
        },
        getAuthHeaders()
      );
      
      toast.success("Review posted successfully!");
      setComment("");
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post review.");
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await axios.delete(`https://collaborative-watchlist-app-backend.onrender.com/api/reviews/${reviewId}`, getAuthHeaders());
      toast.info("Review deleted.");
      fetchReviews();
    } catch (error) {
      toast.error("Failed to delete review.");
    }
  };

  return (
    <div className="mt-10 bg-gray-900/50 p-6 rounded-xl border border-gray-700">
      <h3 className="text-2xl font-bold text-white mb-6">User Reviews ({reviews.length})</h3>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 bg-gray-800 p-4 rounded-lg">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-gray-400 text-sm mb-1">Your Comment</label>
              <textarea
                className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                rows="3"
                placeholder={`Share your thoughts on ${movieTitle}...`}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Rating</label>
              <select
                className="bg-gray-700 text-white p-3 rounded border border-gray-600 focus:outline-none focus:border-blue-500 font-bold"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(num => (
                  <option key={num} value={num}>★ {num}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold transition">
            Post Review
          </button>
        </form>
      ) : (
        <div className="bg-gray-800 p-4 rounded-lg text-center mb-8">
          <p className="text-gray-400">Please <span className="text-blue-400 font-bold">login</span> to verify your identity and post reviews.</p>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Loading reviews...</p>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev._id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-300">{rev.user?.username || "Deleted User"}</span>
                  <span className="text-xs text-gray-500">• {new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 font-bold">★ {rev.rating}</span>
                  {user && user.id === rev.user?._id && (
                    <button onClick={() => handleDelete(rev._id)} className="text-red-500 text-xs hover:underline ml-2">Delete</button>
                  )}
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>
      )}
    </div>
  );
};

export default ReviewSection;