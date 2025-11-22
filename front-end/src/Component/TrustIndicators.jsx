import React from 'react';
import { CalendarCheck, Globe, DollarSign, Users, MapPin, Star, ShieldCheck } from 'lucide-react';

function TrustIndicators() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white via-purple-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3 text-gray-800">What You Can Do</h2>
          <p className="text-xl text-gray-600">Explore, plan, and personalize your travel experience</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
          <div className="col-span-2 bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-purple-100 hover:border-purple-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center shadow-md">
              <Globe className="text-purple-600" size={28} />
            </div>
            <div className="text-lg font-semibold text-center">Explore Destinations</div>
            <div className="text-gray-600 text-center">Browse places by category and interest</div>
          </div>

          <div className="col-span-2 bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-blue-100 hover:border-blue-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-md">
              <CalendarCheck className="text-blue-600" size={28} />
            </div>
            <div className="text-lg font-semibold text-center">Plan Dates</div>
            <div className="text-gray-600 text-center">Pick check-in and check-out for your trip</div>
          </div>

          <div className="col-span-2 bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-green-100 hover:border-green-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-md">
              <DollarSign className="text-green-600" size={28} />
            </div>
            <div className="text-lg font-semibold text-center">Set Budget</div>
            <div className="text-gray-600 text-center">Adjust min/max to fit your plans</div>
          </div>

          <div className="col-span-2 bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-orange-100 hover:border-orange-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center shadow-md">
              <Star className="text-orange-600" size={28} />
            </div>
            <div className="text-lg font-semibold text-center">Save Favorites</div>
            <div className="text-gray-600 text-center">Wishlist destinations to revisit later</div>
          </div>

          <div className="col-span-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 text-white">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center">
              <MapPin size={28} />
            </div>
            <div className="text-lg font-semibold text-center">Map View</div>
            <div className="text-sm opacity-90 text-center">Find places by location</div>
          </div>

          <div className="col-span-2 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 text-white">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center">
              <Users size={28} />
            </div>
            <div className="text-lg font-semibold text-center">Invite Friends</div>
            <div className="text-sm opacity-90 text-center">Plan trips together</div>
          </div>

          <div className="col-span-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 text-white">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center">
              <ShieldCheck size={28} />
            </div>
            <div className="text-lg font-semibold text-center">Account Login</div>
            <div className="text-sm opacity-90 text-center">Access your saved preferences</div>
          </div>

          <div className="col-span-2 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 text-white">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center">
              <Star size={28} />
            </div>
            <div className="text-lg font-semibold text-center">Personalize Profile</div>
            <div className="text-sm opacity-90 text-center">Tailor recommendations to you</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrustIndicators;