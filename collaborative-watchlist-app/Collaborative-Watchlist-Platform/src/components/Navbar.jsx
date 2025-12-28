import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  // Kullanıcıyı localStorage'dan çekiyoruz
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="bg-gray-800 p-4 shadow-md relative z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo / Brand Name */}
        <Link to="/" className="text-2xl font-bold text-blue-500">
          MovieApp
        </Link>

        {/* Navigation Links */}
        <div className="space-x-4 flex items-center">
          
          {/* Herkesin görebileceği Home Linki */}
          <Link to="/" className="text-gray-300 hover:text-white transition">
            Home
          </Link>

          {/* --- ADMIN LINKI BURAYA EKLENDI --- */}
          {/* Sadece giriş yapmış ve rolü 'admin' olanlar görür */}
          {user && user.role === 'admin' && (
            <Link to="/admin" className="text-red-400 hover:text-red-300 font-bold transition">
              Admin Panel
            </Link>
          )}

          {user ? (
            // Links for logged-in users
            <>
              <span className="text-gray-400">|</span>
              <Link to="/dashboard" className="text-blue-300 hover:text-white transition">Dashboard</Link>
              <span className="text-gray-400">|</span>
              <span className="text-blue-300 font-medium">{user.username}</span>
              <button 
                onClick={handleLogout} 
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition"
              >
                Logout
              </button>
            </>
          ) : (
            // Links for guests
            <>
              <Link to="/login" className="text-gray-300 hover:text-white transition">
                Login
              </Link>
              <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;