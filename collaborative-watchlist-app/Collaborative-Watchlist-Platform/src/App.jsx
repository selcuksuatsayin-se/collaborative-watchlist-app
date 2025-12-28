import { Routes, Route } from "react-router-dom";
// --- TOASTIFY IMPORTLARI ---
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // CSS dosyasını unutma!

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import Dashboard from "./pages/Dashboard";
import WatchlistPage from "./pages/WatchlistPage";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white pb-10">
      <Navbar />
      
      {/* Bildirimlerin çıkacağı yer (Global) */}
      <ToastContainer position="top-right" theme="dark" />

      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/watchlist/:id" element={<WatchlistPage />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;