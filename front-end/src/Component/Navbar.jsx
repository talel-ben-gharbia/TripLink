import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Menu, X } from "lucide-react";
import { API_URL } from "../config";
import api from "../api";
import NotificationCenter from "./NotificationCenter";
import DarkModeToggle from "./DarkModeToggle";

function Navbar({ openAuth }) {
  const [user, setUser] = useState(null);

  const verifyAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await api.get("/api/me");
      const data = res.data;
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (err) {
      // Token invalid, clear storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 header-blur z-50 transition-all duration-300 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
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
        </Link>
        <ul className="hidden md:flex space-x-6">
          <li>
            <Link to="/" className="hover:text-primary transition-all duration-200 font-medium relative group">
              <span className="relative z-10">Home</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </li>
          <li>
            <Link to="/destinations" className="hover:text-primary transition-all duration-200 font-medium relative group">
              <span className="relative z-10">Destinations</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </li>
          <li>
            <Link to="/collections" className="hover:text-primary transition-all duration-200 font-medium relative group">
              <span className="relative z-10">Collections</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </li>
          {user && (
            <>
              <li>
                <Link to="/wishlist" className="hover:text-primary transition-colors font-medium">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-primary transition-colors font-medium">
                  My Bookings
                </Link>
              </li>
              {user.isAgent && (
                <li>
                  <Link to="/agent/dashboard" className="hover:text-primary transition-colors font-medium">
                    Agent Dashboard
                  </Link>
                </li>
              )}
              <li>
                <Link to="/profile" className="hover:text-primary transition-colors font-medium">
                  Profile
                </Link>
              </li>
            </>
          )}
        </ul>
        
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <div className="hidden md:flex items-center space-x-4">
          <DarkModeToggle />
          {user ? (
            <>
              <Link to="/help" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Help
              </Link>
              <NotificationCenter />
              <div className="flex items-center space-x-2 text-gray-700">
                <User size={20} />
                <span className="font-medium hidden lg:inline">
                  {user.firstName} {user.lastName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl px-5 py-2 hover:opacity-90 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                title="Logout"
                aria-label="Logout"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={openAuth}
              className="btn-gradient px-5 py-2 shadow-lg hover:shadow-xl transition-all"
              aria-label="Sign up or Sign in"
            >
              Sign up / Sign in
            </button>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-gray-700 hover:text-primary transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/destinations"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-gray-700 hover:text-primary transition-colors font-medium"
            >
              Destinations
            </Link>
            {user ? (
              <>
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-gray-700 hover:text-primary transition-colors font-medium"
                >
                  Wishlist
                </Link>
                <Link
                  to="/bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-gray-700 hover:text-primary transition-colors font-medium"
                >
                  My Bookings
                </Link>
                {user?.isAgent && (
                  <Link
                    to="/agent/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-gray-700 hover:text-primary transition-colors font-medium"
                  >
                    Agent Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-gray-700 hover:text-primary transition-colors font-medium"
                >
                  Profile
                </Link>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-gray-700 mb-3">
                    <User size={20} />
                    <span className="font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl px-5 py-2 hover:opacity-90 font-semibold shadow-lg transition-all"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => {
                  openAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full btn-gradient px-5 py-2 shadow-lg transition-all"
              >
                Sign up / Sign in
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
