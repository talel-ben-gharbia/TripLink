import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import Navbar from '../Component/Navbar';
import Footer from '../Component/Footer';
import { getCollections } from '../services/collectionService';

/**
 * Phase 1: Collections Browse Page
 * Lists all available curated collections
 */
const Collections = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const data = await getCollections(filter === 'all' ? null : filter);
        setCollections(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load collections:', error);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };
    loadCollections();
  }, [filter]);

  const types = ['all', 'seasonal', 'theme', 'featured'];

  return (
    <div className="min-h-screen page-bg flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-purple-600" size={32} />
            <h1 className="text-4xl font-bold brand-gradient-text">Curated Collections</h1>
          </div>
          <p className="text-gray-600">Discover handpicked destinations for every type of traveler</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                filter === type
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-300'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-purple-600" size={48} />
          </div>
        ) : collections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <div
                key={collection.id}
                onClick={() => navigate(`/collections/${collection.slug}`)}
                className="bg-white rounded-2xl overflow-hidden border shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
              >
                {collection.coverImage && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={collection.coverImage}
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1">{collection.name}</h3>
                      {collection.type && (
                        <span className="inline-block px-2 py-1 bg-purple-600/80 text-white text-xs rounded-full">
                          {collection.type}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {!collection.coverImage && (
                  <div className="h-48 bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Sparkles className="text-white" size={48} />
                  </div>
                )}
                <div className="p-6">
                  {collection.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{collection.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {collection.destinationCount || 0} destinations
                    </span>
                    <ArrowRight className="text-purple-600 group-hover:translate-x-1 transition-transform" size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border">
            <Sparkles className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No collections found.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Collections;

