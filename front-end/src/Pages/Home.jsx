import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../Component/Navbar";
import AuthModal from "../Component/AuthModal";
import { CheckCircle, AlertCircle } from "lucide-react";
import { API_URL } from "../config";

function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [searchParams] = useSearchParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Array of background images
  const backgroundImages = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  ];

  // Check backend connection on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/health", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (res.ok) {
          setBackendStatus("connected");
        } else {
          setBackendStatus("error");
        }
      } catch (err) {
        console.error("Backend connection error:", err);
        setBackendStatus("error");
      }
    };
    checkBackend();
  }, []);

  useEffect(() => {
    // Check login status
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Redirect admin users to admin dashboard
        if (parsedUser.isAdmin) {
          window.location.href = "/admin";
          return;
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    // Check email verification
    const emailVerification = searchParams.get("emailVerification");
    if (emailVerification === "success") {
      alert("Email verified successfully! You can now login.");
      setIsOpen(true);
    } else if (emailVerification === "error") {
      alert("Email verification failed. Please try again or contact support.");
    }
  }, [searchParams]);

  // Update user when login succeeds
  useEffect(() => {
    const handleStorageChange = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Also check on focus
    window.addEventListener("focus", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  // Cycle through background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % backgroundImages.length
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <div
      className="App h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 z-0"></div>

      {/* Content wrapper to ensure content stays above overlay */}
      <div className="relative z-10 h-full overflow-y-auto scrollbar-hide">
        <Navbar openAuth={() => setIsOpen(true)} />
        <AuthModal
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            // Refresh user data after login
            const userData = localStorage.getItem("user");
            if (userData) {
              try {
                setUser(JSON.parse(userData));
              } catch (e) {
                console.error("Error parsing user data:", e);
              }
            }
          }}
        />

        {/* Backend Connection Status */}
        {backendStatus === "error" && (
          <div className="container mx-auto px-4 py-4">
            <div className="bg-white/95 backdrop-blur-sm border border-red-300 rounded-xl p-6 mb-6 flex items-center space-x-4 shadow-2xl">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="text-red-600" size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-800 mb-2">
                  ⚠️ Backend Connection Failed
                </h2>
                <p className="text-red-700 mb-2">
                  Cannot connect to backend at http://127.0.0.1:8000. Please make
                  sure the backend server is running.
                </p>
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <p className="text-sm text-red-600 font-medium">
                    Start the backend with:{" "}
                    <code className="bg-white px-2 py-1 rounded font-mono text-xs border border-red-200">
                      cd backend && php -S 127.0.0.1:8000 -t public
                    </code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="container mx-auto px-4 h-full flex flex-col justify-center">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 text-shadow-lg">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                TripLink
              </span>
            </h1>
            <p className="text-lg text-white/95 mb-6 max-w-2xl mx-auto leading-relaxed font-semibold text-shadow">
              Connect with fellow travelers, discover amazing destinations, and create unforgettable memories together
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              {!user ? (
                <button
                  onClick={() => setIsOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-base hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center space-x-2 border-2 border-white/30 backdrop-blur-sm"
                >
                  <span>Start Your Journey</span>
                </button>
              ) : (
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/30 max-w-md">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="text-white" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-green-800">
                        Welcome back, {user.firstName}
                      </h2>
                      <p className="text-green-700 text-sm">Ready for your next adventure?</p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => window.location.href = "/profile"}
                      className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold border-2 border-blue-200 hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                <div className="text-white text-xl">👥</div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Connect with Travelers</h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                Meet like-minded travelers, share experiences, and create lasting friendships
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                <div className="text-white text-xl">📍</div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Discover Places</h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                Find hidden gems and popular destinations recommended by fellow travelers
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                <div className="text-white text-xl">📅</div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Plan Together</h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                Organize trips, share itineraries, and create amazing travel plans together
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;