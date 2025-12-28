import React from "react";
import { useNavigate } from "react-router-dom"; // Yönlendirme için gerekli

const MovieCard = ({ movie }) => {
  const navigate = useNavigate(); // Hook'u tanımla

  const imagePath = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
    : "https://via.placeholder.com/500x750?text=No+Image";

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 flex flex-col h-full">
      <img 
        src={imagePath} 
        alt={movie.title} 
        className="w-full h-96 object-cover" 
      />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-white truncate mb-2" title={movie.title}>
          {movie.title}
        </h3>
        <div className="flex justify-between items-center mb-4">
          <span className="bg-blue-600 text-xs text-white px-2 py-1 rounded opacity-80">
            {movie.release_date?.split("-")[0] || "N/A"}
          </span>
          <span className={`text-sm font-bold ${movie.vote_average >= 7 ? "text-green-400" : "text-yellow-400"}`}>
            ★ {movie.vote_average?.toFixed(1)}
          </span>
        </div>
        
        {/* Butona tıklayınca detay sayfasına git */}
        <button 
          onClick={() => navigate(`/movie/${movie.id}`)}
          className="mt-auto w-full bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 rounded transition border border-gray-600"
        >
           View Details
        </button>
      </div>
    </div>
  );
};

export default MovieCard;