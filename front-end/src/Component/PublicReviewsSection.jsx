import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Globe, User, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { API_URL } from '../config';

/**
 * Public Reviews Section Component
 * Displays all public reviews on the homepage
 */
const PublicReviewsSection = ({ limit = 100 }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadPublicReviews = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/api/reviews/public?limit=${limit || 100}`);
      
      // Handle response - Symfony returns direct array
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (response.data && response.data.reviews && Array.isArray(response.data.reviews)) {
        data = response.data.reviews;
      }
      
      // Public reviews loaded successfully
      setReviews(data);
    } catch (error) {
      // Failed to load public reviews - error logged for debugging
      setError(error.message || 'Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadPublicReviews();
    // Set up interval to refresh reviews every 30 seconds
    const interval = setInterval(() => {
      loadPublicReviews();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadPublicReviews]);


  if (loading) {
    return (
      <section className="container mx-auto px-4 py-12 lg:py-16">
        <div className="mb-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold brand-gradient-text mb-3 section-title flex items-center justify-center gap-3">
            <MessageSquare className="text-purple-600" size={32} />
            Reviews
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">What travelers are saying about their experiences</p>
        </div>
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading reviews...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12 lg:py-16">
      <div className="mb-8 lg:mb-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <MessageSquare className="text-purple-600" size={32} />
          <h2 className="text-4xl lg:text-5xl font-bold brand-gradient-text section-title">Reviews</h2>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">What travelers are saying about their experiences</p>
        {reviews.length > 0 && (
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-700 border border-purple-200 font-semibold">
            {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
          </div>
        )}
      </div>
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 mb-4">Error loading reviews: {error}</p>
          <button
            onClick={loadPublicReviews}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-8 text-center">
          <MessageSquare className="mx-auto text-purple-400 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Public Reviews Yet</h3>
          <p className="text-gray-700 mb-6 max-w-md mx-auto">
            Be the first to share your travel experiences! Write a review on any destination to help other travelers.
          </p>
          <button
            onClick={() => navigate('/destinations')}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg hover:opacity-90 font-semibold transition-all hover:scale-105"
          >
            Explore Destinations
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {reviews.map((review) => (
          <div
            key={review.id}
            onClick={() => navigate(`/destinations/${review.destination.id}`)}
            className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl hover:border-purple-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center flex-shrink-0">
                  {review.user?.avatar ? (
                    <>
                      <img
                        src={`${API_URL}/uploads/profiles/${review.user.avatar}`}
                        alt={review.user?.firstName || 'User'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.parentElement.querySelector('.avatar-fallback');
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full bg-purple-100 flex items-center justify-center text-purple-700 avatar-fallback" style={{ display: 'none' }}>
                        <User size={20} />
                      </div>
                    </>
                  ) : (
                    <User size={20} className="text-purple-700" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm">
                    {review.user?.firstName && review.user?.lastName
                      ? `${review.user.firstName} ${review.user.lastName}`
                      : review.user?.email || 'Anonymous'}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={12} />
                    {review.destination.city
                      ? `${review.destination.city}, ${review.destination.country}`
                      : review.destination.country}
                  </div>
                </div>
              </div>
            </div>
            {review.destination.image && (
              <div className="h-32 rounded-lg overflow-hidden mb-3">
                <img
                  src={review.destination.image}
                  alt={review.destination.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="mb-3">
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                  />
                ))}
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">{review.destination.name}</h3>
              {review.comment && (
                <p className="text-sm text-gray-700 line-clamp-2">{review.comment}</p>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
              <span>
                {new Date(review.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1 text-green-600">
                <Globe size={12} />
                Public
              </span>
            </div>
          </div>
        ))}
        </div>
      )}
    </section>
  );
};

export default PublicReviewsSection;

