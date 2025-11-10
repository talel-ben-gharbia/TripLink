import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { API_URL } from "../config";

function Navbar({ openAuth }) {
  const [user, setUser] = useState(null);

  const verifyAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        // Token invalid, clear storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } catch (err) {
      console.error("Auth verification failed:", err);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        // Verify token is still valid
        verifyAuth();
      } catch (e) {
        console.error("Error parsing user data:", e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch(`${API_URL}/api/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: 'include', // send refresh cookie to be cleared
        });
      } catch (e) {
        console.error("Logout API call failed:", e);
      }
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 header-blur z-50">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
          <div>
            <span className="text-2xl font-bold brand-gradient-text">
              Trip Link
            </span>
            <div className="text-xs text-gray-600">
              Intelligent Travel Companion
            </div>
          </div>
        </div>
        <ul className="flex space-x-6">
          <li>
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
          </li>
          <li>
            <a href="#" className="hover:text-primary">
              Destinations
            </a>
          </li>
        </ul>

        {user ? (
          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Profile
            </Link>
            <Link
              to="/settings"
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Settings
            </Link>
            <div className="flex items-center space-x-2 text-gray-700">
              <User size={20} />
              <span className="font-medium">
                {user.firstName} {user.lastName}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl px-5 py-2 hover:opacity-90 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
              title="Logout"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={openAuth}
            className="btn-gradient px-5 py-2 shadow-lg hover:shadow-xl transition-all"
          >
            Sign up / Sign in
          </button>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
