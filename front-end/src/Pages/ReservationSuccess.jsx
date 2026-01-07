import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, Home } from 'lucide-react';

const ReservationSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your reservation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <CheckCircle size={80} className="text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reservation Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Your payment was successful and your reservation has been confirmed.
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">What's Next?</h2>
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <p className="text-gray-700">
                You will receive a confirmation email with your reservation details shortly.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <p className="text-gray-700">
                Check your email for important travel information and instructions.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <p className="text-gray-700">
                You can view and manage your reservations in your account dashboard.
              </p>
            </div>
          </div>
        </div>

        {sessionId && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Session ID:</span> {sessionId}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/profile')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:opacity-90 transition font-medium flex items-center justify-center gap-2"
          >
            <Calendar size={20} />
            View My Reservations
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

export default ReservationSuccess;
