import { toast } from "react-toastify"; // Import et
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  // State to hold form data
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send POST request to backend API
      await axios.post("https://collaborative-watchlist-app-backend.onrender.com/api/auth/register", formData);
      
      // Notify user and redirect to login page
      toast.success("Successfully registered! Please login.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      // Display error message from backend or a generic message
      toast.error(error.response?.data?.message || "Registration failed."); // Güzelleştirme
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-500">Sign Up</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Username</label>
            <input
              type="text"
              name="username"
              onChange={handleChange}
              className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="johndoe"
              required
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="name@company.com"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded transition duration-200"
          >
            Create Account
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;