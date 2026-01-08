import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Award, Users, Star, Clock, CheckCircle, Globe, DollarSign, Headphones, Loader2 } from 'lucide-react';
import api from '../api';

function TrustIndicators() {
  const [stats, setStats] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load stats
        const statsRes = await api.get('/api/stats/public');
        const statsData = statsRes.data.formatted || statsRes.data.stats;
        
        setStats([
          { icon: Users, value: statsData.users || '0', label: 'Happy Travelers', color: 'from-blue-500 to-cyan-500' },
          { icon: Globe, value: statsData.destinations || '0', label: 'Destinations', color: 'from-purple-500 to-pink-500' },
          { icon: Star, value: statsData.rating || '0.0', label: 'Average Rating', color: 'from-yellow-500 to-orange-500' },
          { icon: CheckCircle, value: statsData.satisfaction || '0%', label: 'Satisfaction Rate', color: 'from-green-500 to-emerald-500' },
        ]);

        // Load testimonials
        try {
          const testimonialsRes = await api.get('/api/testimonials/featured');
          setTestimonials(testimonialsRes.data.testimonials || []);
        } catch (e) {
          // Failed to load testimonials - error logged for debugging
          setTestimonials([]);
        }
      } catch (error) {
        // Failed to load stats - error logged for debugging
        // Fallback to default stats
        setStats([
          { icon: Users, value: '0', label: 'Happy Travelers', color: 'from-blue-500 to-cyan-500' },
          { icon: Globe, value: '0', label: 'Destinations', color: 'from-purple-500 to-pink-500' },
          { icon: Star, value: '0.0', label: 'Average Rating', color: 'from-yellow-500 to-orange-500' },
          { icon: CheckCircle, value: '0%', label: 'Satisfaction Rate', color: 'from-green-500 to-emerald-500' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const trustBadges = [
    {
      icon: ShieldCheck,
      title: 'Secure Payment',
      description: '256-bit SSL encryption',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      icon: Lock,
      title: 'Privacy Protected',
      description: 'Your data is safe with us',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      icon: Award,
      title: 'Verified Partners',
      description: 'Trusted travel providers',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Always here to help',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
  ];

  if (loading || !stats) {
    return (
      <section className="py-20 px-4 bg-gradient-to-b from-white via-purple-50/30 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <Loader2 className="mx-auto animate-spin text-purple-600 mb-4" size={32} />
            <p className="text-gray-600">Loading trust indicators...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white via-purple-50/30 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Stats Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-3 text-gray-900">Trusted by Travelers Worldwide</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Join thousands of satisfied customers who trust TripLink for their travel needs</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-gray-100 hover:border-purple-200"
                >
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <Icon className="text-white" size={32} />
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">Why Choose TripLink?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustBadges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div
                  key={idx}
                  className={`${badge.bgColor} ${badge.borderColor} border-2 rounded-xl p-6 hover:shadow-lg transition-all transform hover:-translate-y-1`}
                >
                  <Icon className={`${badge.color} mb-4`} size={32} />
                  <h4 className="font-bold text-gray-900 mb-2">{badge.title}</h4>
                  <p className="text-sm text-gray-600">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">What Our Customers Say</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100"
                >
                  <div className="flex items-center mb-4">
                    {testimonial.avatar ? (
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover mr-3"
                        onError={(e) => {
                          e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(testimonial.name);
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-3 text-purple-700 font-semibold">
                        {testimonial.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.location}</div>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={star <= testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} size={16} />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">"{testimonial.text}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Trust Elements */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <Headphones className="mx-auto mb-4" size={48} />
            <h3 className="text-2xl font-bold mb-3">Need Help? We're Here 24/7</h3>
            <p className="text-lg mb-6 opacity-90">
              Our dedicated support team is available around the clock to assist you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@triplink.com"
                className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Email Support
              </a>
              <a
                href="/help"
                className="px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition border-2 border-white/30"
              >
                Visit Help Center
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrustIndicators;
