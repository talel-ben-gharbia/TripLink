import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles, MapPin, Heart, Calendar, SkipForward } from 'lucide-react';
import { completeOnboarding, skipOnboarding } from '../services/onboardingService';
import { getAllCategories, getAllTags } from '../services/destinationService';
import { useErrorToast } from './ErrorToast';

/**
 * Phase 1: Onboarding Wizard Component
 * First-login onboarding flow with preference selection
 */
const Onboarding = ({ onComplete, onSkip }) => {
  const { showToast, ToastContainer } = useErrorToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [budgetRange, setBudgetRange] = useState({ min: 100, max: 5000 });
  const [travelStyle, setTravelStyle] = useState('');

  useEffect(() => {
    // Load available categories and tags
    const loadOptions = async () => {
      try {
        const [cats, tagList] = await Promise.all([
          getAllCategories(),
          getAllTags()
        ]);
        setCategories(cats || []);
        setTags(tagList || []);
      } catch (error) {
        // Failed to load onboarding options - error logged for debugging
      }
    };
    loadOptions();
  }, []);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await completeOnboarding({
        categories: selectedCategories,
        tags: selectedTags,
        budgetMin: budgetRange.min,
        budgetMax: budgetRange.max,
        travelStyle
      });
      onComplete && onComplete();
    } catch (error) {
      showToast('Failed to save preferences. Please try again.', 'error', 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await skipOnboarding();
      onSkip && onSkip();
    } catch (error) {
      showToast('Failed to skip onboarding. Please try again.', 'error', 5000);
    } finally {
      setLoading(false);
    }
  };

  const travelStyles = [
    { value: 'budget', label: 'Budget Traveler', icon: '💰' },
    { value: 'luxury', label: 'Luxury Seeker', icon: '✨' },
    { value: 'adventure', label: 'Adventure Enthusiast', icon: '🏔️' },
    { value: 'relaxation', label: 'Relaxation Seeker', icon: '🏖️' },
    { value: 'culture', label: 'Culture Explorer', icon: '🏛️' },
    { value: 'family', label: 'Family Traveler', icon: '👨‍👩‍👧‍👦' }
  ];

  return (
    <>
      <ToastContainer />
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold brand-gradient-text">Welcome to TripLink!</h2>
            <p className="text-sm text-gray-600 mt-1">Let's personalize your experience</p>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">Step {step} of 3</span>
            <span className="text-xs text-gray-600">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Travel Style */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Sparkles className="mx-auto text-purple-600 mb-4" size={48} />
                <h3 className="text-xl font-semibold mb-2">What's your travel style?</h3>
                <p className="text-gray-600">Help us recommend destinations you'll love</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {travelStyles.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setTravelStyle(style.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      travelStyle === style.value
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{style.icon}</div>
                    <div className="text-sm font-medium">{style.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Categories & Tags */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <MapPin className="mx-auto text-purple-600 mb-4" size={48} />
                <h3 className="text-xl font-semibold mb-2">What interests you?</h3>
                <p className="text-gray-600">Select categories and tags that match your preferences</p>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium mb-3">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategories((prev) =>
                          prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                        );
                      }}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        selectedCategories.includes(cat)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-3">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 20).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTags((prev) =>
                          prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                        );
                      }}
                      className={`px-3 py-1 rounded-full text-xs transition-all ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Budget */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <Heart className="mx-auto text-purple-600 mb-4" size={48} />
                <h3 className="text-xl font-semibold mb-2">What's your budget range?</h3>
                <p className="text-gray-600">This helps us show you relevant destinations</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Budget</label>
                  <input
                    type="number"
                    value={budgetRange.min}
                    onChange={(e) => setBudgetRange({ ...budgetRange, min: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Maximum Budget</label>
                  <input
                    type="number"
                    value={budgetRange.max}
                    onChange={(e) => setBudgetRange({ ...budgetRange, max: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min={budgetRange.min}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6 flex items-center justify-between">
          <button
            onClick={handleSkip}
            disabled={loading}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            <SkipForward size={18} />
            Skip for now
          </button>
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2"
                disabled={loading}
              >
                <ArrowLeft size={18} />
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                disabled={loading || (step === 1 && !travelStyle)}
              >
                Next
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Complete'}
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Onboarding;

