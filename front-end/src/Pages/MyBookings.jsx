import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Component/Navbar';
import Footer from '../Component/Footer';
import AuthModal from '../Component/AuthModal';
import { getMyBookings, cancelBooking, updateBooking, completeBooking, createCheckoutSession } from '../services/bookingService';
import { Calendar, MapPin, Users, DollarSign, X, CheckCircle, Clock, AlertCircle, Pencil, Loader2, CreditCard } from 'lucide-react';
import { BookingCardSkeleton } from '../Component/LoadingSkeleton';
import { EmptyBookings } from '../Component/EmptyState';
import ErrorMessage from '../Component/ErrorMessage';
import { handleApiError } from '../utils/errorHandler';
import { useErrorToast } from '../Component/ErrorToast';

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const { showToast, ToastContainer } = useErrorToast();

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-auth-modal', handler);
    return () => window.removeEventListener('open-auth-modal', handler);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token || !userData) {
      setIsOpen(true);
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (e) {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyBookings();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Error loading bookings:', err);
      const errorInfo = handleApiError(err);
      setError(errorInfo);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId, bookingReference) => {
    if (!window.confirm(`Are you sure you want to cancel booking ${bookingReference}?`)) {
      return;
    }

    try {
      await cancelBooking(bookingId, 'Cancelled by user');
      loadBookings();
    } catch (err) {
      const errorInfo = handleApiError(err);
      showToast(errorInfo.message || 'Failed to cancel booking', 'error', 5000);
    }
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking.id);
    setEditFormData({
      checkInDate: booking.checkInDate || '',
      checkOutDate: booking.checkOutDate || '',
      numberOfGuests: booking.numberOfGuests || 1,
      contactEmail: booking.contactEmail || '',
      contactPhone: booking.contactPhone || '',
      specialRequests: booking.specialRequests || '',
    });
  };

  const handleSaveEdit = async (bookingId) => {
    try {
      await updateBooking(bookingId, editFormData);
      setEditingBooking(null);
      setEditFormData({});
      loadBookings();
      showToast('Booking updated successfully!', 'success', 3000);
    } catch (err) {
      const errorInfo = handleApiError(err);
      showToast(errorInfo.message || 'Failed to update booking', 'error', 5000);
    }
  };

  const handleCancelEdit = () => {
    setEditingBooking(null);
    setEditFormData({});
  };

  const handleComplete = async (bookingId) => {
    if (!window.confirm('Mark this booking as completed?')) {
      return;
    }

    try {
      await completeBooking(bookingId);
      showToast('Booking marked as completed!', 'success', 3000);
      loadBookings();
    } catch (err) {
      const errorInfo = handleApiError(err);
      showToast(errorInfo.message || 'Failed to complete booking', 'error', 5000);
    }
  };

  const handleCompletePayment = async (bookingId) => {
    try {
      const checkoutData = await createCheckoutSession(bookingId);
      
      if (checkoutData.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = checkoutData.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      alert(errorInfo.message || 'Failed to start payment');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'PENDING':
        return <Clock className="text-yellow-600" size={20} />;
      case 'CANCELLED':
        return <X className="text-red-600" size={20} />;
      default:
        return <AlertCircle className="text-gray-600" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen page-bg">
        <Navbar openAuth={() => setIsOpen(true)} />
        <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
            <p className="text-gray-600">Manage and view all your trip bookings</p>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <BookingCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg flex flex-col">
      <Navbar openAuth={() => setIsOpen(true)} />
      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      
      <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage and view all your trip bookings</p>
        </div>

        {error && !loading && (
          <div className="mb-6">
            <ErrorMessage
              error={error}
              onRetry={loadBookings}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {bookings.length === 0 && !error ? (
          <EmptyBookings onCreateBooking={() => navigate('/destinations')} />
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {booking.destination.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(booking.status)} flex items-center gap-2`}>
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-mono text-purple-600">#{booking.bookingReference}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <MapPin size={16} />
                      <span>{booking.destination.city}, {booking.destination.country}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      ${booking.totalPrice}
                    </div>
                    <div className={`text-sm font-semibold ${
                      booking.status === 'CANCELLED' && (booking.paymentStatus === 'PENDING' || booking.paymentStatus === 'FAILED') ? 'text-red-600' :
                      booking.paymentStatus === 'PAID' ? 'text-green-600' :
                      booking.paymentStatus === 'PENDING' ? 'text-yellow-600' :
                      booking.paymentStatus === 'REFUNDED' ? 'text-blue-600' :
                      booking.paymentStatus === 'FAILED' || booking.paymentStatus === 'CANCELLED' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {booking.status === 'CANCELLED' && (booking.paymentStatus === 'PENDING' || booking.paymentStatus === 'FAILED') ? '✗ Payment Declined' :
                       booking.paymentStatus === 'PAID' ? '✓ Paid' : 
                       booking.paymentStatus === 'PENDING' ? '⏳ Payment Pending' :
                       booking.paymentStatus === 'REFUNDED' ? '↩ Refunded' :
                       booking.paymentStatus === 'FAILED' ? '✗ Payment Declined' :
                       booking.paymentStatus === 'CANCELLED' ? '✗ Payment Cancelled' :
                       booking.paymentStatus}
                    </div>
                    {booking.status === 'PENDING' && booking.bookingType === 'DIRECT' && booking.paymentStatus === 'PENDING' && (
                      <div className="text-xs text-purple-600 mt-1 font-medium">
                        Payment Required
                      </div>
                    )}
                    {booking.status === 'CANCELLED' && (booking.paymentStatus === 'PENDING' || booking.paymentStatus === 'FAILED') && (
                      <div className="text-xs text-red-600 mt-1 font-medium">
                        Payment Declined
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Check-in</div>
                      <div className="font-semibold">{booking.checkInDate}</div>
                    </div>
                  </div>
                  {booking.checkOutDate && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-500" />
                      <div>
                        <div className="text-xs text-gray-500">Check-out</div>
                        <div className="font-semibold">{booking.checkOutDate}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Guests</div>
                      <div className="font-semibold">{booking.numberOfGuests}</div>
                    </div>
                  </div>
                </div>

                {booking.specialRequests && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-blue-600 font-semibold mb-1">Special Requests</div>
                    <div className="text-sm text-blue-800">{booking.specialRequests}</div>
                  </div>
                )}

                {booking.agent && (
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                    <div className="text-xs text-purple-600 font-semibold mb-1">Assigned Agent</div>
                    <div className="text-sm text-purple-800">
                      {booking.agent.profile?.firstName} {booking.agent.profile?.lastName}
                    </div>
                  </div>
                )}

                {booking.status === 'PENDING' && booking.bookingType === 'DIRECT' && booking.paymentStatus === 'PENDING' && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-yellow-900 mb-1">Payment Required</div>
                        <div className="text-xs text-yellow-700">
                          Complete your payment to confirm this booking. You will be redirected to our secure payment page.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {editingBooking === booking.id ? (
                  <div className="pt-4 border-t border-gray-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                        <input
                          type="date"
                          value={editFormData.checkInDate}
                          onChange={(e) => setEditFormData({...editFormData, checkInDate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                        <input
                          type="date"
                          value={editFormData.checkOutDate}
                          onChange={(e) => setEditFormData({...editFormData, checkOutDate: e.target.value})}
                          min={editFormData.checkInDate}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                        <input
                          type="number"
                          min="1"
                          value={editFormData.numberOfGuests}
                          onChange={(e) => setEditFormData({...editFormData, numberOfGuests: parseInt(e.target.value) || 1})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                        <input
                          type="email"
                          value={editFormData.contactEmail}
                          onChange={(e) => setEditFormData({...editFormData, contactEmail: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                        <input
                          type="tel"
                          value={editFormData.contactPhone || ''}
                          onChange={(e) => setEditFormData({...editFormData, contactPhone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                      <textarea
                        value={editFormData.specialRequests || ''}
                        onChange={(e) => setEditFormData({...editFormData, specialRequests: e.target.value})}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Any special requirements..."
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSaveEdit(booking.id)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Booked on {new Date(booking.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Show Complete Payment for DIRECT bookings that are PENDING, or AGENT bookings that are CONFIRMED but payment is PENDING */}
                      {((booking.status === 'PENDING' && booking.bookingType === 'DIRECT') || 
                        (booking.status === 'CONFIRMED' && booking.bookingType === 'AGENT')) && 
                        booking.paymentStatus === 'PENDING' && (
                        <button
                          onClick={() => handleCompletePayment(booking.id)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 font-semibold"
                        >
                          <CreditCard size={16} />
                          Complete Payment
                        </button>
                      )}
                      {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleEdit(booking)}
                          className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition flex items-center gap-2"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleComplete(booking.id)}
                          className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition flex items-center gap-2"
                        >
                          <CheckCircle size={16} />
                          Mark Complete
                        </button>
                      )}
                      {booking.status === 'PENDING' && booking.bookingType === 'DIRECT' && booking.paymentStatus !== 'PENDING' && (
                        <button
                          onClick={() => handleCancel(booking.id, booking.bookingReference)}
                          className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition flex items-center gap-2"
                        >
                          <X size={16} />
                          Cancel Booking
                        </button>
                      )}
                      {booking.status === 'PENDING' && booking.bookingType === 'AGENT' && (
                        <button
                          onClick={() => handleCancel(booking.id, booking.bookingReference)}
                          className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition flex items-center gap-2"
                        >
                          <X size={16} />
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <Footer />
    </div>
  );
};

export default MyBookings;

