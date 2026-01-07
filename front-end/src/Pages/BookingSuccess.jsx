import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../Component/Navbar';
import Footer from '../Component/Footer';
import SEO from '../Component/SEO';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { verifyCheckoutSession } from '../services/bookingService';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);

  const sessionId = searchParams.get('session_id');
  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !bookingId) {
        setError('Missing payment information');
        setLoading(false);
        return;
      }

      try {
        const result = await verifyCheckoutSession(bookingId, sessionId);
        setBooking(result.booking);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Payment verification failed');
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen page-bg flex flex-col">
        <SEO title="Booking Confirmation - TripLink" />
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Loader2 className="mx-auto mb-4 text-purple-600 animate-spin" size={48} />
            <p className="text-gray-600">Verifying your payment...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen page-bg flex flex-col">
        <SEO title="Payment Verification - TripLink" />
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
            <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/bookings')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              View My Bookings
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg flex flex-col">
      <SEO 
        title="Booking Confirmed - TripLink"
        description={`Your booking ${booking?.bookingReference || ''} has been confirmed. Thank you for choosing TripLink!`}
      />
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 animate-fade-up">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full border border-gray-100 animate-slide-up">
          <div className="mb-6 animate-pulse-glow">
            <CheckCircle className="mx-auto text-green-600" size={80} />
          </div>
          <h2 className="text-3xl font-bold brand-gradient-text mb-3">Payment Successful!</h2>
          <p className="text-gray-600 mb-6 text-lg">Your booking has been confirmed.</p>
          
          {booking && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl mb-6 border border-purple-100 animate-fade-in">
              <p className="text-sm text-gray-600 mb-2 font-medium">Booking Reference</p>
              <p className="text-3xl font-bold gradient-text-animated">{booking.bookingReference}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/bookings')}
              className="flex-1 px-6 py-3 btn-primary text-white rounded-lg font-semibold"
            >
              View My Bookings
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold text-gray-700 hover:border-purple-300"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingSuccess;


