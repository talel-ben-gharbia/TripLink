import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, Home } from 'lucide-react';

const ReservationCancelled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <XCircle size={80} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reservation Cancelled</h1>
          <p className="text-lg text-gray-600">
            Your reservation was not completed. No charges have been made to your account.
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">What Happened?</h2>
          <div className="space-y-2 text-left text-gray-700">
            <p>• You cancelled the payment process</p>
            <p>• The payment session expired</p>
            <p>• There was an issue with the payment method</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Don't worry!</strong> You can try again anytime. Your destination is still available for booking.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:opacity-90 transition font-medium flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationCancelled;
