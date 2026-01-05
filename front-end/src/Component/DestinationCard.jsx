import React, { useState } from 'react';
import api from '../api';
import { Heart, MapPin, Sparkles, ArrowRight, Pin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DestinationCard = ({ destination, onWishlistChange, selectable = false, selected = false, onSelectToggle }) => {
  const [loading, setLoading] = useState(false);
  const [wishlisted, setWishlisted] = useState(!!destination.wishlisted);

  const imageUrl = destination.image || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200';
  const navigate = useNavigate();

  const toggleWishlist = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.dispatchEvent(new Event('open-auth-modal'));
        setLoading(false);
        return;
      }
      if (wishlisted) {
        await api.delete(`/api/wishlist/${destination.id}`);
        setWishlisted(false);
        onWishlistChange && onWishlistChange(destination.id, false);
      } else {
        await api.post(`/api/wishlist/${destination.id}`);
        setWishlisted(true);
        onWishlistChange && onWishlistChange(destination.id, true);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 ${selected ? 'border-purple-400' : 'border-transparent hover:border-purple-300'}`}>
      <div className="relative h-64 overflow-hidden">
        <img
          src={imageUrl}
          alt={destination.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=1200&auto=format&fit=crop&q=80'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <button onClick={toggleWishlist} className={`absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg transition-transform ${wishlisted ? 'text-red-500' : 'text-gray-400'}`}>
          <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
        {selectable && (
          <button type="button" onClick={onSelectToggle} className={`absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg z-20 ${selected ? 'text-purple-600' : 'text-gray-500'}`}>
            <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
              {selected && <span className="w-2 h-2 bg-current rounded-full" />}
            </span>
          </button>
        )}
        {destination.isFeatured && (
          <div className="absolute bottom-4 left-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center space-x-1 shadow-lg z-10">
            <Sparkles size={14} />
            <span>Featured</span>
          </div>
        )}
        {destination.isPinned && !destination.isFeatured && (
          <div className="absolute bottom-4 left-4 bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full text-sm font-bold flex items-center space-x-1 shadow-lg z-10 border border-yellow-200">
            <Pin size={14} />
            <span>Pinned</span>
          </div>
        )}
        {destination.aiRecommended && !destination.isFeatured && !destination.isPinned && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1 shadow-lg">
            <Sparkles size={14} />
            <span>AI Pick</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-1 text-gray-900">{destination.name}</h3>
        <div className="text-gray-600 mb-2 flex items-center"><MapPin size={14} className="mr-1" /><span>{destination.city ? `${destination.city}, ${destination.country}` : destination.country}</span></div>
        {destination.rating && (
          <div className="mb-3 flex items-center gap-1">
            <Star size={14} className="text-yellow-500 fill-current" />
            <span className="text-sm font-semibold text-gray-700">{destination.rating.toFixed(1)}</span>
          </div>
        )}
        <div className="mb-4"></div>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-3xl font-bold text-purple-700">{destination.priceMin ? `$${destination.priceMin}` : destination.price ? `$${destination.price}` : ''}</span>
            <span className="text-gray-600">{destination.priceMin || destination.price ? ' / night' : ''}</span>
          </div>
          <button onClick={() => navigate(`/destinations/${destination.id}`)} className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:opacity-90 transition shadow-md flex items-center space-x-1"><span>View</span><ArrowRight size={14} /></button>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
