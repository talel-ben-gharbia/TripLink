import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Trash2, Edit, User, Globe, Lock } from 'lucide-react';
import { getReviews, getReviewStats, createReview, updateReview, deleteReview } from '../services/reviewService';
import AuthModal from './AuthModal';
import { API_URL } from '../config';
import { useErrorToast } from './ErrorToast';

/**
 * Review Section Component
 * Displays reviews and allows users to add/edit/delete their reviews
 */
const ReviewSection = ({ destinationId }) => {
  const { showToast, ToastContainer } = useErrorToast();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadReviews();
    loadStats();
    checkUser();
  }, [destinationId]);

  const checkUser = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (e) {
        setCurrentUser(null);
      }
    }
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await getReviews(destinationId);
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getReviewStats(destinationId);
      setStats(data);
    } catch (error) {
      console.error('Failed to load review stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }

    if (rating < 1 || rating > 5) {
      showToast('Please select a rating between 1 and 5 stars', 'warning', 4000);
      return;
    }

    try {
      setSubmitting(true);
      if (editingReview) {
        await updateReview(destinationId, editingReview.id, rating, comment || null, isPublic);
      } else {
        await createReview(destinationId, rating, comment || null, isPublic);
      }
      setRating(0);
      setComment('');
      setIsPublic(true);
      setShowForm(false);
      setEditingReview(null);
      await loadReviews();
      await loadStats();
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to save review';
      showToast(message, 'error', 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment || '');
    setIsPublic(review.isPublic !== undefined ? review.isPublic : true);
    setShowForm(true);
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await deleteReview(destinationId, reviewId);
      await loadReviews();
      await loadStats();
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to delete review';
      showToast(message, 'error', 5000);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingReview(null);
    setRating(0);
    setComment('');
    setIsPublic(true);
  };

  const userReview = reviews.find(r => currentUser && r.user?.id === currentUser.id);

  return (
    <>
      <ToastContainer />
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h2>
          {stats && (
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={star <= Math.round(stats.averageRating || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                  />
                ))}
                <span className="ml-2 text-lg font-semibold text-gray-700">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                </span>
              </div>
              <span className="text-gray-600">
                ({stats.reviewCount || 0} {stats.reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>
        {currentUser && !userReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <MessageSquare size={18} />
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {editingReview ? 'Edit Your Review' : 'Write a Review'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Comment (Optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Share your experience..."
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <div className="flex items-center gap-2">
                  {isPublic ? (
                    <>
                      <Globe size={16} className="text-green-600" />
                      <span className="text-sm text-gray-700">Make this review public (visible to everyone)</span>
                    </>
                  ) : (
                    <>
                      <Lock size={16} className="text-gray-600" />
                      <span className="text-sm text-gray-700">Keep this review private (only visible to you)</span>
                    </>
                  )}
                </div>
              </label>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || rating < 1}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : editingReview ? 'Update Review' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center">
          <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-4">No reviews yet. Be the first to review this destination!</p>
          {currentUser && !userReview && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Write the First Review
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center text-purple-700 flex-shrink-0">
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
                      <User size={20} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {review.user?.firstName && review.user?.lastName
                          ? `${review.user.firstName} ${review.user.lastName}`
                          : review.user?.email || 'Anonymous'}
                      </span>
                      {review.isPublic === false && currentUser && review.user?.id === currentUser.id && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                          <Lock size={12} />
                          Private
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  {currentUser && review.user?.id === currentUser.id && (
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(review)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit review"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete review"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {review.comment && (
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    </>
  );
};

export default ReviewSection;

