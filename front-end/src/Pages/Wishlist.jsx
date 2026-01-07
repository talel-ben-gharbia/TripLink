import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader2, Trash2, MapPin, Star, Sparkles } from 'lucide-react';
import Navbar from '../Component/Navbar';
import Footer from '../Component/Footer';
import SEO from '../Component/SEO';
import api from '../api';
import DestinationCard from '../Component/DestinationCard';
import { useErrorToast } from '../Component/ErrorToast';

/**
 * Phase 1: Wishlist Page
 * Displays user's saved destinations
 */
const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(new Set());
  const { showToast, ToastContainer } = useErrorToast();

  useEffect(() => {
    const loadWishlist = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }

      try {
        setLoading(true);
        const response = await api.get('/api/wishlist');
        const items = Array.isArray(response.data) ? response.data : [];
        setWishlist(items);
      } catch (error) {
        console.error('Failed to load wishlist:', error);
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, []);

  const handleRemove = async (id) => {
    if (removing.has(id)) return;
    
    setRemoving(prev => new Set(prev).add(id));
    try {
      await api.delete(`/api/wishlist/${id}`);
      setWishlist(prev => prev.filter(item => item.id !== id));
      showToast('Removed from wishlist', 'success', 3000);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      showToast('Failed to remove from wishlist', 'error', 5000);
    } finally {
      setRemoving(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleWishlistChange = (id, wished) => {
    if (!wished) {
      setWishlist(prev => prev.filter(item => item.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen page-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
            <p className="text-gray-600">Loading your wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg flex flex-col">
      <SEO 
        title="My Wishlist - TripLink | Saved Destinations"
        description="View and manage your saved travel destinations. Your personalized wishlist of dream destinations."
      />
      <ToastContainer />
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="text-red-500" size={32} fill="currentColor" />
            <h1 className="text-4xl font-bold brand-gradient-text">My Wishlist</h1>
          </div>
          <p className="text-gray-600">
            {wishlist.length > 0 
              ? `You have ${wishlist.length} saved destination${wishlist.length !== 1 ? 's' : ''}`
              : 'Start saving your favorite destinations'}
          </p>
        </div>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((destination) => (
              <div key={destination.id} className="relative group">
                <DestinationCard
                  destination={destination}
                  onWishlistChange={handleWishlistChange}
                />
                <button
                  onClick={() => handleRemove(destination.id)}
                  disabled={removing.has(destination.id)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 text-red-500 transition-all opacity-0 group-hover:opacity-100 z-30 disabled:opacity-50"
                  aria-label="Remove from wishlist"
                >
                  {removing.has(destination.id) ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <Heart className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Start exploring and save destinations you love!</p>
            <button
              onClick={() => navigate('/destinations')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:opacity-90 transition shadow-md font-medium"
            >
              Browse Destinations
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;

