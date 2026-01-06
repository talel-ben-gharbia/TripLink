import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Component/Navbar';
import api from '../api';
import { Heart, MapPin, Sparkles, Pin, Star, Share2, ChevronLeft, ChevronRight, X, FolderPlus, Folder, Check, Loader2 } from 'lucide-react';
import AuthModal from '../Component/AuthModal';
import ReviewSection from '../Component/ReviewSection';
import * as adminCollectionService from '../services/adminCollectionService';

const DestinationDetails = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [collections, setCollections] = useState([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [destinationCollections, setDestinationCollections] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [addingToCollection, setAddingToCollection] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-auth-modal', handler);
    return () => window.removeEventListener('open-auth-modal', handler);
  }, []);

  useEffect(() => {
    // Check if user is admin
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setIsAdmin(user.isAdmin || false);
      } catch (e) {
        setIsAdmin(false);
      }
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/destinations/${id}`);
        setItem(res.data);
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const w = await api.get('/api/wishlist');
            const wishIds = new Set((w.data || []).map((x) => x.id));
            setWishlisted(wishIds.has(Number(id)));
          } catch {}
        }
      } catch (e) {
        setItem(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (isAdmin) {
      loadCollections();
    }
  }, [isAdmin]);

  const loadCollections = async () => {
    setLoadingCollections(true);
    try {
      const collectionsList = await adminCollectionService.getAdminCollections();
      setCollections(collectionsList || []);
      
      // Check which collections contain this destination
      const collectionsWithDestination = [];
      for (const collection of collectionsList) {
        try {
          const details = await adminCollectionService.getAdminCollection(collection.id);
          if (details.destinations && details.destinations.some(d => d.id === Number(id))) {
            collectionsWithDestination.push(collection.id);
          }
        } catch (e) {
          console.error('Error loading collection details:', e);
        }
      }
      setDestinationCollections(collectionsWithDestination);
    } catch (error) {
      console.error('Error loading collections:', error);
      setCollections([]);
    } finally {
      setLoadingCollections(false);
    }
  };

  const handleAddToCollection = async (collectionId) => {
    if (addingToCollection === collectionId) return;
    
    setAddingToCollection(collectionId);
    try {
      await adminCollectionService.addDestinationToCollection(collectionId, Number(id));
      setDestinationCollections(prev => [...prev, collectionId]);
      alert('Destination added to collection successfully!');
    } catch (error) {
      console.error('Error adding to collection:', error);
      alert(error.response?.data?.error || 'Failed to add destination to collection');
    } finally {
      setAddingToCollection(null);
    }
  };

  const handleRemoveFromCollection = async (collectionId) => {
    if (addingToCollection === collectionId) return;
    
    setAddingToCollection(collectionId);
    try {
      await adminCollectionService.removeDestinationFromCollection(collectionId, Number(id));
      setDestinationCollections(prev => prev.filter(id => id !== collectionId));
      alert('Destination removed from collection successfully!');
    } catch (error) {
      console.error('Error removing from collection:', error);
      alert(error.response?.data?.error || 'Failed to remove destination from collection');
    } finally {
      setAddingToCollection(null);
    }
  };

  const toggleWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.dispatchEvent(new Event('open-auth-modal'));
      return;
    }
    try {
      if (wishlisted) {
        await api.delete(`/api/wishlist/${id}`);
        setWishlisted(false);
      } else {
        await api.post(`/api/wishlist/${id}`);
        setWishlisted(true);
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen page-bg">
        <Navbar openAuth={() => setIsOpen(true)} />
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading destination details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen page-bg">
        <Navbar openAuth={() => setIsOpen(true)} />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center bg-white rounded-2xl p-12 border border-gray-200 shadow-lg max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Destination Not Found</h1>
            <p className="text-gray-600 mb-6">The destination you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/destinations')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:opacity-90 transition shadow-md"
            >
              Browse All Destinations
            </button>
          </div>
        </div>
      </div>
    );
  }

  const images = (item.images && Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []));
  const imageUrl = images[activeIndex] || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.name,
          text: `Check out ${item.name} on TripLink!`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
    setModalImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    setModalImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen page-bg">
      <Navbar openAuth={() => setIsOpen(true)} />
      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Destinations</span>
        </button>

        <div className="rounded-2xl overflow-hidden shadow-lg border bg-white mb-8">
          <div className="relative h-80 md:h-96 bg-gray-100 group">
            <img 
              src={imageUrl} 
              alt={item.name} 
              className="w-full h-full object-cover cursor-pointer" 
              onClick={() => { setShowImageModal(true); setModalImageIndex(activeIndex); }}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            <div className="absolute bottom-4 right-4 flex gap-2">
              {isAdmin && (
                <button
                  onClick={() => setShowCollectionModal(true)}
                  className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                  aria-label="Add to collection"
                  title="Add to Collection"
                >
                  <FolderPlus size={18} />
                </button>
              )}
              <button
                onClick={handleShare}
                className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                aria-label="Share destination"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>
          {images.length > 1 && (
            <div className="px-6 py-4 bg-white border-t">
              <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar">
                {images.map((src, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveIndex(idx)} 
                    className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${activeIndex === idx ? 'border-purple-500 scale-105' : 'border-gray-200 hover:border-purple-300'}`} 
                    aria-label={`Preview ${idx+1}`}
                  >
                    <img 
                      src={src} 
                      alt={`${item.name} ${idx+1}`} 
                      className="w-full h-full object-cover" 
                      loading="lazy" 
                      onError={(e)=>{e.currentTarget.src='https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=400&auto=format&fit=crop&q=80';}} 
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{item.name}</h1>
                  {item.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm rounded-full font-semibold">
                      <Sparkles size={14} />
                      Featured
                    </span>
                  )}
                  {item.isPinned && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full font-semibold border border-yellow-200">
                      <Pin size={14} />
                      Pinned
                    </span>
                  )}
                </div>
                <div className="text-gray-600 mt-1 flex items-center"><MapPin size={16} className="mr-1" />{item.city ? `${item.city}, ${item.country}` : item.country}</div>
              </div>
              <button onClick={toggleWishlist} className={`px-4 py-2 rounded-lg border ${wishlisted ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-gray-700 border-gray-300'} flex items-center space-x-2`}>
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
                <span>{wishlisted ? 'Saved' : 'Save'}</span>
              </button>
            </div>
            {item.description && (
              <p className="mt-4 text-gray-700 leading-relaxed">{item.description}</p>
            )}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border">
                <div className="text-xs text-gray-500">Category</div>
                <div className="text-base font-semibold text-gray-800 capitalize">{item.category || '—'}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border">
                <div className="text-xs text-gray-500">Price Range</div>
                <div className="text-base font-semibold text-gray-800">{item.priceMin ? `$${item.priceMin}` : ''}{item.priceMax ? ` - $${item.priceMax}` : ''}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border">
                <div className="text-xs text-gray-500">Average Rating</div>
                <div className="text-base font-semibold text-gray-800 flex items-center gap-1">
                  {item.rating ? (
                    <>
                      <Star size={16} className="text-yellow-500 fill-current" />
                      {item.rating.toFixed(1)}
                    </>
                  ) : (
                    'No ratings yet'
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => navigate('/destinations')} 
                className="px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
              >
                Browse More
              </button>
              {item.tags && item.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {item.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewSection destinationId={id} />

        {/* Add to Collection Modal (Admin Only) */}
        {showCollectionModal && isAdmin && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCollectionModal(false)}
          >
            <div 
              className="bg-white rounded-2xl shadow-xl border w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <Folder className="text-purple-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-900">Add to Collection</h2>
                </div>
                <button
                  onClick={() => setShowCollectionModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-6">
                {loadingCollections ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-purple-600" size={32} />
                  </div>
                ) : collections.length === 0 ? (
                  <div className="text-center py-12">
                    <Folder className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600 mb-4">No collections available</p>
                    <button
                      onClick={() => {
                        setShowCollectionModal(false);
                        navigate('/admin');
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:opacity-90 transition"
                    >
                      Create Collection
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-gray-600 mb-4">Select collections to add this destination to:</p>
                    {collections.map((collection) => {
                      const isInCollection = destinationCollections.includes(collection.id);
                      const isProcessing = addingToCollection === collection.id;
                      
                      return (
                        <div
                          key={collection.id}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                            isInCollection 
                              ? 'border-purple-500 bg-purple-50' 
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{collection.name}</h3>
                            {collection.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{collection.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-500">
                                {collection.destinationCount || 0} destinations
                              </span>
                              {collection.type && (
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                  {collection.type}
                                </span>
                              )}
                              {!collection.isActive && (
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => isInCollection 
                              ? handleRemoveFromCollection(collection.id)
                              : handleAddToCollection(collection.id)
                            }
                            disabled={isProcessing}
                            className={`ml-4 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                              isInCollection
                                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                : 'bg-purple-600 text-white hover:bg-purple-700'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="animate-spin" size={16} />
                                <span>Processing...</span>
                              </>
                            ) : isInCollection ? (
                              <>
                                <X size={16} />
                                <span>Remove</span>
                              </>
                            ) : (
                              <>
                                <Check size={16} />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && images.length > 0 && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
              aria-label="Close"
            >
              <X size={24} className="text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
              aria-label="Previous"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
              aria-label="Next"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
            <img
              src={images[modalImageIndex]}
              alt={item.name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
              {modalImageIndex + 1} / {images.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationDetails;
