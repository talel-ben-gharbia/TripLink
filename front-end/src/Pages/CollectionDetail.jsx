import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import Navbar from '../Component/Navbar';
import Footer from '../Component/Footer';
import SEO from '../Component/SEO';
import DestinationCard from '../Component/DestinationCard';
import { getCollectionBySlug } from '../services/collectionService';

/**
 * Phase 1: Collection Detail Page
 * Shows a curated collection with its destinations
 */
const CollectionDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCollection = async () => {
      try {
        const data = await getCollectionBySlug(slug);
        setCollection(data);
      } catch (error) {
        // Failed to load collection - error logged for debugging
        setError('Collection not found');
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      loadCollection();
    }
  }, [slug]);

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

  if (error || !collection) {
    return (
      <div className="min-h-screen page-bg">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Collection Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The collection you are looking for does not exist.'}</p>
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
        title={collection ? `${collection.name} - Curated Collection - TripLink` : 'Collection - TripLink'}
        description={collection ? collection.description || `Explore ${collection.name}, a curated collection of amazing destinations.` : 'Explore curated travel collections'}
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

        {/* Collection Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-purple-600" size={32} />
            <h1 className="text-4xl font-bold brand-gradient-text">{collection.name}</h1>
          </div>
          {collection.description && (
            <p className="text-gray-600 text-lg max-w-3xl">{collection.description}</p>
          )}
          {collection.type && (
            <span className="inline-block mt-4 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              {collection.type}
            </span>
          )}
        </div>

        {/* Destinations */}
        {collection.destinations && collection.destinations.length > 0 ? (
          <div>
            <h2 className="text-2xl font-semibold mb-6">
              {collection.destinations.length} Destination{collection.destinations.length !== 1 ? 's' : ''}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {collection.destinations.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border">
            <p className="text-gray-600">No destinations in this collection yet.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CollectionDetail;

