import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Heart, Star, Loader2 } from 'lucide-react';
import Navbar from '../Component/Navbar';
import Footer from '../Component/Footer';
import SEO from '../Component/SEO';
import { getPublicProfile } from '../services/profileService';

/**
 * Phase 1: Public Profile Page
 * Displays read-only user profile with contribution summary
 */
const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getPublicProfile(id);
        setProfile(data);
      } catch (error) {
        console.error('Failed to load profile:', error);
        setError('Profile not found or not available');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      loadProfile();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen page-bg">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-purple-600" size={48} />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen page-bg">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The profile you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:opacity-90"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg flex flex-col">
      <SEO 
        title={profile ? `${profile.firstName} ${profile.lastName} - Traveler Profile - TripLink` : 'Traveler Profile - TripLink'}
        description={profile ? `View ${profile.firstName} ${profile.lastName}'s travel profile, contributions, and favorite destinations on TripLink.` : 'View traveler profile and contributions'}
      />
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg border p-8">
          {/* Profile Header */}
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {profile.firstName && profile.lastName
                  ? `${profile.firstName} ${profile.lastName}`
                  : profile.email || 'User'}
              </h1>
              {profile.memberSince && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <span className="text-sm">Member since {new Date(profile.memberSince).toLocaleDateString()}</span>
                </div>
              )}
              {profile.isVerified && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  <User size={14} />
                  Verified Traveler
                </div>
              )}
            </div>
          </div>

          {/* Contribution Summary */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Contributions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="text-purple-600" size={24} />
                  <div>
                    <div className="text-2xl font-bold text-purple-700">{profile.wishlistCount || 0}</div>
                    <div className="text-sm text-gray-600">Wishlisted</div>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="text-blue-600" size={24} />
                  <div>
                    <div className="text-2xl font-bold text-blue-700">{profile.reviewCount || 0}</div>
                    <div className="text-sm text-gray-600">Reviews</div>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <User className="text-green-600" size={24} />
                  <div>
                    <div className="text-2xl font-bold text-green-700">
                      {(profile.wishlistCount || 0) + (profile.reviewCount || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Contributions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Travel Preferences (if available) */}
          {profile.preferences && (
            <div className="border-t pt-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Travel Preferences</h2>
              <div className="space-y-2">
                {profile.preferences.categories && profile.preferences.categories.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Categories: </span>
                    <span className="text-sm text-gray-800">
                      {profile.preferences.categories.join(', ')}
                    </span>
                  </div>
                )}
                {profile.preferences.tags && profile.preferences.tags.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Interests: </span>
                    <span className="text-sm text-gray-800">
                      {profile.preferences.tags.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PublicProfile;

