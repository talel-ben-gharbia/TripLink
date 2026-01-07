import React, { useState } from 'react';
import { X, Calendar, CreditCard, User, FileText } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import api from '../api';

const ReservationModal = ({ destination, onClose }) => {
  const [formData, setFormData] = useState({
    passportNumber: '',
    fullName: '',
    email: '',
    phone: '',
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
    specialRequests: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotalPrice = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0;
    
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) return 0;
    
    const pricePerNight = destination.priceMin || destination.price || 0;
    return nights * pricePerNight * formData.numberOfGuests;
  };

  const calculateNights = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0;
    
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    return nights > 0 ? nights : 0;
  };

  const validateForm = () => {
    if (!formData.passportNumber.trim()) {
      setError('Passport number is required');
      return false;
    }
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.checkInDate) {
      setError('Check-in date is required');
      return false;
    }
    if (!formData.checkOutDate) {
      setError('Check-out date is required');
      return false;
    }
    
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkIn < today) {
      setError('Check-in date cannot be in the past');
      return false;
    }
    
    if (checkOut <= checkIn) {
      setError('Check-out date must be after check-in date');
      return false;
    }
    
    if (formData.numberOfGuests < 1) {
      setError('Number of guests must be at least 1');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to make a reservation');
        setLoading(false);
        return;
      }

      const totalPrice = calculateTotalPrice();
      
      // Create reservation and get Stripe session
      const response = await api.post('/api/reservations/create-checkout-session', {
        destinationId: destination.id,
        passportNumber: formData.passportNumber,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        numberOfGuests: formData.numberOfGuests,
        specialRequests: formData.specialRequests,
        totalPrice: totalPrice
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(response.data.publishableKey);
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: response.data.sessionId
      });

      if (stripeError) {
        setError(stripeError.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = calculateTotalPrice();
  const nights = calculateNights();
  const pricePerNight = destination.priceMin || destination.price || 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reserve Your Trip</h2>
            <p className="text-sm text-gray-600 mt-1">{destination.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCheckout} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User size={20} />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passport Number *
                </label>
                <input
                  type="text"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="A12345678"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
          </div>

          {/* Travel Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar size={20} />
              Travel Dates
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Date *
                </label>
                <input
                  type="date"
                  name="checkInDate"
                  value={formData.checkInDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Date *
                </label>
                <input
                  type="date"
                  name="checkOutDate"
                  value={formData.checkOutDate}
                  onChange={handleChange}
                  min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Guests *
                </label>
                <input
                  type="number"
                  name="numberOfGuests"
                  value={formData.numberOfGuests}
                  onChange={handleChange}
                  min="1"
                  max="20"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Special Requests */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={20} />
              Special Requests
            </h3>
            
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Any special requirements or requests..."
            />
          </div>

          {/* Price Summary */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard size={20} />
              Price Summary
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Price per night:</span>
                <span className="font-medium">${pricePerNight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Number of nights:</span>
                <span className="font-medium">{nights}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Number of guests:</span>
                <span className="font-medium">{formData.numberOfGuests}</span>
              </div>
              <div className="border-t border-purple-200 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-purple-700">${totalPrice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || totalPrice === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  Proceed to Checkout
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal;
