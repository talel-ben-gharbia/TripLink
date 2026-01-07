import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../Component/Navbar';
import Footer from '../Component/Footer';
import SEO from '../Component/SEO';
import { XCircle } from 'lucide-react';

const BookingCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('booking_id');

  return (
    <div className="min-h-screen page-bg flex flex-col">
      <SEO 
        title="Payment Cancelled - TripLink"
        description="Your payment was cancelled. You can complete the payment later from your bookings page."
      />
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
          <XCircle className="mx-auto mb-4 text-yellow-600" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h2>
          <p className="text-gray-600 mb-6">
            Your payment was cancelled. Your booking is still pending. You can complete the payment later from your bookings page.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/bookings')}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              View My Bookings
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
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

export default BookingCancel;


