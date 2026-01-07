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
import CollectionsSection from "../Component/CollectionsSection";
import Onboarding from "../Component/Onboarding";
import PublicReviewsSection from "../Component/PublicReviewsSection";
import SEO from "../Component/SEO";
import { AlertCircle, Headphones, ArrowUp, MapPin, Star, Sparkles } from "lucide-react";
import { useErrorToast } from "../Component/ErrorToast";
import api from "../api";
import { getFeaturedDestinations } from "../services/destinationService";
import { getRecommendations } from "../services/recommendationService";
import { API_URL } from "../config";
import DestinationCard from "../Component/DestinationCard";
import { trackPageView } from "../utils/analytics";


function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [searchParams] = useSearchParams();
  const { showToast, ToastContainer } = useErrorToast();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [featuredDestinations, setFeaturedDestinations] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  // Check backend connection on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_URL}/health`, {
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

  // Phase 1: Check onboarding status
  useEffect(() => {
    const checkOnboarding = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await api.get('/api/me');
        if (response.data?.needsOnboarding) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
      }
    };
    checkOnboarding();
  }, []);

  // Phase 1: Load featured destinations
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const data = await getFeaturedDestinations();
        // Handle different response formats
        if (Array.isArray(data)) {
          setFeaturedDestinations(data.slice(0, 6));
        } else if (data.destinations && Array.isArray(data.destinations)) {
          setFeaturedDestinations(data.destinations.slice(0, 6));
        } else if (data.data && Array.isArray(data.data)) {
          setFeaturedDestinations(data.data.slice(0, 6));
        } else {
          setFeaturedDestinations([]);
        }
      } catch (error) {
        console.error('Failed to load featured destinations:', error);
        setFeaturedDestinations([]);
      }
    };
    loadFeatured();
  }, []);

  // Load personalized recommendations for logged-in users
  useEffect(() => {
    const loadRecommendations = async () => {
      const token = localStorage.getItem("token");
      if (!token || !user) return;

      setRecommendationsLoading(true);
      try {
        const data = await getRecommendations(6);
        // Handle different response formats
        if (Array.isArray(data)) {
          setRecommendations(data);
        } else if (data.recommendations && Array.isArray(data.recommendations)) {
          setRecommendations(data.recommendations);
        } else if (data.destinations && Array.isArray(data.destinations)) {
          setRecommendations(data.destinations.map(d => ({ destination: d })));
        } else {
          setRecommendations([]);
        }
      } catch (error) {
        console.error('Failed to load recommendations:', error);
        setRecommendations([]);
      } finally {
        setRecommendationsLoading(false);
      }
    };
    loadRecommendations();
  }, [user]);


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
      showToast("Email verified successfully! You can now login.", "success", 5000);
      setIsOpen(true);
    } else if (emailVerification === "error") {
      showToast("Email verification failed. Please try again or contact support.", "error", 5000);
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



  // Track page view for analytics
  useEffect(() => {
    trackPageView('/');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-white" id="main-content">
      <SEO 
        title="TripLink - Intelligent Travel Companion | Discover Amazing Destinations"
        description="Discover and book amazing travel destinations with TripLink. Get personalized recommendations, intelligent routing, and professional travel services. Start your journey today!"
        keywords="travel booking, vacation planning, destinations, travel agent, intelligent routing, personalized travel"
      />

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
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
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
                  Cannot connect to backend at {API_URL}. Please make
                  sure the backend server is running.
                </p>
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <p className="text-sm text-red-600 font-medium">
                    Start the backend with:{" "}
                    <code className="bg-white px-2 py-1 rounded font-mono text-xs border border-red-200">
                      cd backend && php -S {API_URL.replace('http://', '')} -t public
                    </code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="w-full">
          <Hero showCTA={!user} onStart={() => setIsOpen(true)} />
        </div>

        {/* Search Bar Section */}
        <div className="container mx-auto px-4 -mt-8 mb-8 relative z-20">
          <SearchBar simple onSearch={(payload) => {
            const el = document.getElementById('destinations');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            try {
              window.dispatchEvent(new CustomEvent('home-search', { detail: payload }));
            } catch {}
            showToast('Searching destinations...', 'success', 1500);
          }} />
        </div>

        {/* Section Divider */}
        <div className="container mx-auto px-4 mb-12">
          <div className="section-divider" aria-hidden="true" />
        </div>

        {/* Featured Destinations Section */}
        <section className="container mx-auto px-4 py-12 lg:py-16">
          <div className="mb-8 lg:mb-12 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold brand-gradient-text mb-3 section-title">Featured Destinations</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Handpicked destinations carefully selected for unforgettable experiences</p>
          </div>
          {featuredDestinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {featuredDestinations.map((dest, idx) => (
                <div
                  key={dest.id}
                  onClick={() => window.location.href = `/destinations/${dest.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 animate-fade-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {dest.image && (
                    <div className="h-56 lg:h-64 overflow-hidden relative">
                      <img 
                        src={dest.image} 
                        alt={dest.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&auto=format&fit=crop&q=80'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {dest.isFeatured && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg z-10">
                          <Sparkles size={12} />
                          <span>Featured</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">{dest.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 flex items-center gap-1">
                      <MapPin size={14} className="text-gray-400" />
                      <span>{dest.city ? `${dest.city}, ${dest.country}` : dest.country}</span>
                    </p>
                    {dest.rating && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Star size={16} className="text-yellow-500 fill-current" />
                          <span className="font-semibold text-gray-900 ml-1">{dest.rating.toFixed(1)}</span>
                        </div>
                        {dest.priceMin && (
                          <span className="text-purple-600 font-semibold">From ${dest.priceMin}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <Sparkles className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No featured destinations available at the moment.</p>
            </div>
          )}
        </section>

        {/* Section Divider */}
        <div className="container mx-auto px-4 my-12">
          <div className="section-divider" aria-hidden="true" />
        </div>

        {/* Personalized Recommendations Section (for logged-in users) */}
        {user && recommendations.length > 0 && (
          <>
            <section className="container mx-auto px-4 py-12 lg:py-16">
              <div className="mb-8 lg:mb-12 text-center">
                <h2 className="text-4xl lg:text-5xl font-bold brand-gradient-text mb-3 section-title flex items-center justify-center gap-3">
                  <Sparkles className="text-purple-600" size={32} />
                  Recommended For You
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Destinations tailored to your preferences and travel history
                </p>
              </div>
              {recommendationsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden border bg-white animate-pulse">
                      <div className="h-64 bg-gray-200" />
                      <div className="p-6 space-y-3">
                        <div className="h-6 w-2/3 bg-gray-200 rounded" />
                        <div className="h-4 w-1/2 bg-gray-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {recommendations.map((rec, idx) => (
                    <div
                      key={rec.destination.id}
                      onClick={() => window.location.href = `/destinations/${rec.destination.id}`}
                      className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 animate-fade-up relative"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      {rec.destination.image && (
                        <div className="h-56 lg:h-64 overflow-hidden relative">
                          <img 
                            src={rec.destination.image} 
                            alt={rec.destination.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            loading="lazy"
                            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&auto=format&fit=crop&q=80'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          {rec.score && (
                            <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10">
                              Score: {typeof rec.score === 'number' ? rec.score.toFixed(0) : rec.score}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">{rec.destination.name}</h3>
                        <p className="text-gray-600 text-sm mb-4 flex items-center gap-1">
                          <MapPin size={14} className="text-gray-400" />
                          <span>{rec.destination.city ? `${rec.destination.city}, ${rec.destination.country}` : rec.destination.country}</span>
                        </p>
                        {rec.reasons && Array.isArray(rec.reasons) && rec.reasons.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2">Why we recommend this:</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {rec.reasons.slice(0, 2).map((reason, i) => (
                                <li key={i} className="flex items-center gap-1">
                                  <span className="text-purple-600">•</span>
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {rec.destination.rating && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <Star size={16} className="text-yellow-500 fill-current" />
                              <span className="font-semibold text-gray-900 ml-1">{rec.destination.rating.toFixed(1)}</span>
                            </div>
                            {rec.destination.priceMin && (
                              <span className="text-purple-600 font-semibold">From ${rec.destination.priceMin}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <div className="container mx-auto px-4 my-12">
              <div className="section-divider" aria-hidden="true" />
            </div>
          </>
        )}

        {/* Collections Section */}
        <CollectionsSection limit={3} />

        {/* Section Divider */}
        <div className="container mx-auto px-4 my-12">
          <div className="section-divider" aria-hidden="true" />
        </div>

        {/* Destinations Section */}
        <section id="destinations" className="container mx-auto px-4 py-12 lg:py-16">
          {!user ? (
            <DestinationSection mode="popular" />
          ) : (
            <DestinationSection mode="recommended" />
          )}
        </section>

        {/* Section Divider */}
        <div className="container mx-auto px-4 my-12">
          <div className="section-divider" aria-hidden="true" />
        </div>

        {/* Reviews Section */}
        <PublicReviewsSection limit={100} />

        {/* Section Divider */}
        <div className="container mx-auto px-4 my-12">
          <div className="section-divider" aria-hidden="true" />
        </div>

        {/* Trust Indicators Section */}
        <section className="py-12 lg:py-16 bg-white/50">
          <TrustIndicators />
        </section>

        {/* Section Divider */}
        <div className="container mx-auto px-4 my-12">
          <div className="section-divider" aria-hidden="true" />
        </div>

        {/* FAQ Section */}
        <section className="py-12 lg:py-16">
          <FAQ />
        </section>

        {/* Footer */}
        <Footer />

        {/* Phase 1: Onboarding Modal */}
        {showOnboarding && (
          <Onboarding
            onComplete={() => {
              setShowOnboarding(false);
              // Refresh user data
              const userData = localStorage.getItem("user");
              if (userData) {
                try {
                  setUser(JSON.parse(userData));
                } catch (e) {
                  console.error("Error parsing user data:", e);
                }
              }
            }}
            onSkip={() => setShowOnboarding(false)}
          />
        )}

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
