import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { getCollections } from '../services/collectionService';
import DestinationCard from './DestinationCard';

/**
 * Phase 1: Collections Section Component
 * Displays curated destination collections
 */
const CollectionsSection = ({ limit = 3 }) => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const data = await getCollections();
        setCollections(Array.isArray(data) ? data.slice(0, limit) : []);
      } catch (error) {
        console.error('Failed to load collections:', error);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };
    loadCollections();
  }, [limit]);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="text-purple-600" size={32} />
            <h2 className="text-4xl lg:text-5xl font-bold brand-gradient-text section-title">
              Curated Collections
            </h2>
          </div>
        </div>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-purple-600" size={32} />
        </div>
      </section>
    );
  }

  if (collections.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4">
      <div className="mb-8 lg:mb-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Sparkles className="text-purple-600" size={32} />
          <h2 className="text-4xl lg:text-5xl font-bold brand-gradient-text section-title">
            Curated Collections
          </h2>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">Handpicked destinations for every traveler</p>
        <button
          onClick={() => navigate('/collections')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-lg"
        >
          View All Collections
          <ArrowRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {collections.map((collection) => (
          <div
            key={collection.id}
            onClick={() => navigate(`/collections/${collection.slug}`)}
            className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
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
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{collection.description}</p>
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
    </section>
  );
};

export default CollectionsSection;

