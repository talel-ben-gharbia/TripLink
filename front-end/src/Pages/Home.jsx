import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../Component/Navbar";
import DestinationSection from "../Component/DestinationSection";
import AuthModal from "../Component/AuthModal";
import Hero from "../Component/Hero";
import SearchBar from "../Component/SearchBar";
import TrustIndicators from "../Component/TrustIndicators";
import FAQ from "../Component/FAQ";
import Footer from "../Component/Footer";
import { AlertCircle, Headphones, ArrowUp } from "lucide-react";
import { useErrorToast } from "../Component/ErrorToast";


function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [searchParams] = useSearchParams();
  const { showToast, ToastContainer } = useErrorToast();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

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
          showToast("Backend connection failed", "error", 3500);
        }
      } catch (err) {
        console.error("Backend connection error:", err);
        setBackendStatus("error");
        showToast("Backend connection error", "error", 3500);
      }
    };
    checkBackend();
  }, [showToast]);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-auth-modal', handler);
    return () => window.removeEventListener('open-auth-modal', handler);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 400);
      const doc = document.documentElement;
      const total = (doc.scrollHeight - doc.clientHeight) || 1;
      setScrollProgress(Math.min(1, Math.max(0, window.scrollY / total)));
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
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



  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-white">

      <div className="relative z-10 h-full overflow-y-auto scrollbar-hide">
        <div className="fixed top-0 left-0 h-1 z-50" style={{ width: `${scrollProgress * 100}%`, backgroundImage: 'linear-gradient(90deg, #7c3aed, #2563eb, #06b6d4)' }} aria-hidden="true" />
        <Navbar openAuth={() => setIsOpen(true)} />
        <ToastContainer />
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

        <div className="w-full flex flex-col space-y-4">
          <Hero showCTA={!user} onStart={() => setIsOpen(true)} />
          <SearchBar simple onSearch={() => {
            const el = document.getElementById('destinations');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            showToast('Searching destinations...', 'success', 1500);
          }} />
          <div className="px-4">
            <div className="section-divider" aria-hidden="true" />
          </div>

        </div>


        <div id="destinations" className="container mx-auto px-4 pb-10">
          {!user ? (
            <DestinationSection mode="popular" />
          ) : (
            <DestinationSection mode="recommended" />
          )}
        </div>
        <div className="container mx-auto px-4 mb-8">
          <div className="section-divider" aria-hidden="true" />
        </div>
        <TrustIndicators />
        <FAQ />
        <Footer />
        {showBackToTop && (
          <>
            <button
              aria-label="Back to top"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-xl flex items-center justify-center hover:opacity-90"
            >
              <ArrowUp />
            </button>
            <a
              href="mailto:support@triplink.com"
              aria-label="Contact support"
              className="fixed bottom-6 right-20 w-12 h-12 rounded-full bg-white/80 backdrop-blur-xl text-purple-700 shadow-xl flex items-center justify-center hover:bg-white"
            >
              <Headphones />
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
