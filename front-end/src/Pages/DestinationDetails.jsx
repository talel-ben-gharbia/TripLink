import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Component/Navbar';
import api from '../api';
import { Heart, MapPin } from 'lucide-react';
import AuthModal from '../Component/AuthModal';

const DestinationDetails = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-auth-modal', handler);
    return () => window.removeEventListener('open-auth-modal', handler);
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
    return <div className="min-h-screen page-bg"><Navbar openAuth={() => setIsOpen(true)} /><div className="container mx-auto px-4 py-10">Loading...</div></div>;
  }

  if (!item) {
    return <div className="min-h-screen page-bg"><Navbar openAuth={() => setIsOpen(true)} /><div className="container mx-auto px-4 py-10">Not found</div></div>;
  }

  const images = (item.images && Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []));
  const imageUrl = images[activeIndex] || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200';

  return (
    <div className="min-h-screen page-bg">
      <Navbar openAuth={() => setIsOpen(true)} />
      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="rounded-2xl overflow-hidden shadow-lg border bg-white">
          <div className="h-80 bg-gray-100">
            <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="px-6 py-4 bg-white border-t">
              <div className="flex items-center gap-3 overflow-x-auto">
                {images.map((src, idx) => (
                  <button key={src} onClick={() => setActiveIndex(idx)} className={`w-20 h-14 rounded-lg overflow-hidden border ${activeIndex === idx ? 'border-purple-500' : 'border-gray-200'}`} aria-label={`Preview ${idx+1}`}>
                    <img src={src} alt={`${item.name} ${idx+1}`} className="w-full h-full object-cover" loading="lazy" onError={(e)=>{e.currentTarget.src='https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=400&auto=format&fit=crop&q=80';}} />
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{item.name}</h1>
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
                <div className="text-xs text-gray-500">Country</div>
                <div className="text-base font-semibold text-gray-800">{item.country}</div>
              </div>
            </div>
            <div className="mt-6">
              <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg bg-gray-100">Back</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetails;
