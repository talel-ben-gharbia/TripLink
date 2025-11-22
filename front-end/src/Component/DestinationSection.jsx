import React, { useEffect, useState } from 'react';
import api from '../api';
import DestinationCard from './DestinationCard';

const DestinationSection = ({ mode }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  

  const loadData = async () => {
    setLoading(true);
    try {
      let url = '/api/destinations';
      if (mode === 'popular') url = '/api/destinations/popular';
      if (mode === 'recommended') url = '/api/destinations/recommended';
      const params = {};
      if (mode === 'popular') {
      } else {
        if (q) params.q = q;
        
      }
      const res = await api.get(url, { params });
      let data = res.data || [];
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const w = await api.get('/api/wishlist');
          const wishIds = new Set((w.data || []).map((x) => x.id));
          data = data.map((d) => ({ ...d, wishlisted: wishIds.has(d.id) }));
        } catch {}
      }
      setItems(data);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const onSearch = async (e) => {
    e.preventDefault();
    await loadData();
  };

  const handleWishlistChange = (id, wished) => {
    setItems((prev) => prev.map((d) => d.id === id ? { ...d, wishlisted: wished } : d));
  };

  return (
    <section className="pt-6 pb-12 px-4 max-w-7xl mx-auto animate-fade-up" id="destinations">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-4xl font-bold brand-gradient-text">
            {mode === 'popular' ? 'Popular Destinations' : mode === 'recommended' ? 'Recommended For You' : 'Destinations'}
          </h2>
          <div className="mt-2 h-1 w-28 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full" />
          <div className="mt-2 text-sm text-gray-600">Find your next escape</div>
        </div>
        <div className="text-sm text-gray-700 font-medium">
          {items.length} results
        </div>
      </div>
      
      {mode !== 'popular' && (
        <form onSubmit={onSearch} className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 mb-6 flex gap-3 items-center border border-white/40 shadow">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, city, or country"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3"
          />
          <button type="submit" className="px-5 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">Search</button>
        </form>
      )}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border bg-white">
              <div className="h-56 animate-shimmer" />
              <div className="p-6 space-y-3">
                <div className="h-6 w-2/3 bg-gray-200 rounded animate-shimmer" />
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-shimmer" />
                <div className="h-4 w-1/3 bg-gray-200 rounded animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((d, i) => (
            <div key={d.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <DestinationCard destination={d} onWishlistChange={handleWishlistChange} />
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center bg-white rounded-2xl p-8 text-gray-700">No destinations found — try a different filter</div>
          )}
        </div>
      )}
      <div className="text-center mt-12">
        <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:opacity-90 transition shadow-lg font-semibold">Load More Destinations</button>
      </div>
    </section>
  );
};

export default DestinationSection;
