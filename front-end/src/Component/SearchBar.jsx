import React, { useState } from 'react';
import { MapPin, Loader2, Search as SearchIcon, Users, DollarSign } from 'lucide-react';
import DatePicker from './DatePicker';

function SearchBar({ compact = false, simple = false, onSearch }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [destination, setDestination] = useState('');
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(2);
  const [budgetMin, setBudgetMin] = useState(100);
  const [budgetMax, setBudgetMax] = useState(1000);

  const popularDestinations = ['Paris', 'Tokyo', 'Bali', 'New York', 'Dubai', 'Barcelona'];

  const handleSearch = () => {
    setSearching(true);
    const payload = { destination, checkIn, checkOut, guests, budgetMin, budgetMax };
    setTimeout(() => {
      setSearching(false);
      onSearch && onSearch(payload);
    }, 600);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };



  return (
    <div className={`${compact ? 'w-full' : 'max-w-6xl mx-auto px-4 -mt-24 md:-mt-32'} relative z-20`}>
      <div className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl ${compact ? 'p-4' : 'p-6'} transform hover:scale-[1.01] transition-all duration-300 border-2 border-white/40 glass-ring`}>
        {!compact && (
          <div className="mb-2" />
        )}

        <div className={`${compact ? (simple ? 'grid grid-cols-1 md:grid-cols-3 gap-3' : 'grid grid-cols-1 md:grid-cols-5 gap-3') : (simple ? 'grid grid-cols-1 md:grid-cols-3 gap-4' : 'grid grid-cols-1 md:grid-cols-5 gap-4')}`}>
          <div className={simple ? 'md:col-span-2' : 'md:col-span-2'}>
            {!compact && <label className="block text-sm font-medium mb-2 text-gray-700">Destination</label>}
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-lg text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search destinations, cities, or countries"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all bg-white shadow-sm"
              />
              {showSuggestions && !compact && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border p-2 z-10">
                  <div className="text-xs text-gray-500 mb-2 px-2">Popular destinations</div>
                  {popularDestinations.map((dest, idx) => (
                    <div
                      key={idx}
                      onClick={() => { setDestination(dest); setShowSuggestions(false); }}
                      className="px-3 py-2 hover:bg-purple-50 rounded cursor-pointer flex items-center space-x-2 transition-colors"
                    >
                      <MapPin size={14} className="text-purple-600" />
                      <span className="text-sm text-gray-700">{dest}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {!simple && (
            <div>
              {!compact && <label className="block text-sm font-medium mb-2 text-gray-700">Check-in</label>}
              <DatePicker
                value={checkIn}
                onChange={setCheckIn}
                placeholder="Select date"
                isOpen={checkInOpen}
                onOpen={() => setCheckInOpen(true)}
                onClose={() => setCheckInOpen(false)}
              />
            </div>
          )}

          {!simple && (
            <div>
              {!compact && <label className="block text-sm font-medium mb-2 text-gray-700">Check-out</label>}
              <DatePicker
                value={checkOut}
                onChange={setCheckOut}
                placeholder="Select date"
                isOpen={checkOutOpen}
                onOpen={() => setCheckOutOpen(true)}
                onClose={() => setCheckOutOpen(false)}
              />
            </div>
          )}

          {!simple && (
            <div>
              {!compact && <label className="block text-sm font-medium mb-2 text-gray-700">Guests</label>}
              <div className="relative">
                <Users className="absolute left-3 top-3 text-gray-500" size={18} />
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} className="px-3 py-2 hover:bg-gray-100">-</button>
                  <input
                    type="number"
                    value={guests}
                    onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value || '1')))}
                    className="w-full px-3 py-2 md:py-3 text-center focus:outline-none"
                    min={1}
                  />
                  <button type="button" onClick={() => setGuests(guests + 1)} className="px-3 py-2 hover:bg-gray-100">+</button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={searching}
              className="w-full py-3 md:py-4 btn-gradient-animated text-white rounded-lg hover:opacity-90 transition flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md hover:shadow-lg font-medium animate-scale-in focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              {searching ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span className={compact ? 'hidden md:inline' : ''}>Searching...</span>
                </>
              ) : (
                <>
                  <SearchIcon size={18} />
                  <span className={compact ? 'hidden md:inline' : ''}>Search</span>
                </>
              )}
            </button>
          </div>
        </div>

        {!compact && (
          <>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500 font-medium">Popular:</span>
                <div className="flex flex-wrap gap-2">
                  {['Beach', 'Mountain', 'City', 'Luxury', 'Adventure'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setDestination(filter)}
                      className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-full shadow-sm hover:border-purple-400 hover:text-purple-700 transition-colors"
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="text-green-600" size={16} />
                  <input
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(Math.max(0, parseInt(e.target.value || '0')))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                    placeholder="Min"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(Math.max(budgetMin, parseInt(e.target.value || String(budgetMin))))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
