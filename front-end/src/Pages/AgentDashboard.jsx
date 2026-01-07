import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Component/Navbar';
import Footer from '../Component/Footer';
import AuthModal from '../Component/AuthModal';
import {
  getAgentDashboard,
  getPendingBookings,
  getAgentBookings,
  assignBooking,
  confirmAgentBooking,
} from '../services/agentService';
import * as bookingService from '../services/bookingService';
import {
  Briefcase,
  Calendar,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Loader2,
  Pencil,
  Check,
} from 'lucide-react';
import ClientPortfolio from './Agent/ClientPortfolio';
import { BookingCardSkeleton, StatsCardSkeleton } from '../Component/LoadingSkeleton';
import { EmptyBookingsAgent, EmptyPackages } from '../Component/EmptyState';
import { useErrorToast } from '../Component/ErrorToast';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
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
      const parsedUser = JSON.parse(userData);
      if (!parsedUser.isAgent) {
        navigate('/');
        return;
      }
      setUser(parsedUser);
    } catch (e) {
      setIsOpen(true);
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user, activeTab]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const data = await getAgentDashboard();
        setStats(data.stats);
        setMyBookings(data.recentBookings || []);
      } else if (activeTab === 'pending') {
        const data = await getPendingBookings();
        setPendingBookings(data.bookings || []);
      } else if (activeTab === 'my-bookings') {
        const data = await getAgentBookings();
        setMyBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignBooking = async (bookingId) => {
    try {
      await assignBooking(bookingId);
      showToast('Booking assigned successfully!', 'success', 3000);
      // After assigning, switch to "My Bookings" to see the assigned booking
      setActiveTab('my-bookings');
      loadDashboard();
    } catch (error) {
      showToast('Failed to assign booking: ' + (error.response?.data?.error || error.message), 'error', 5000);
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to confirm this booking? It will be moved to your confirmed bookings.')) {
      return;
    }
    
    try {
      await confirmAgentBooking(bookingId);
      showToast('Booking confirmed successfully!', 'success', 3000);
      // Refresh all tabs to ensure booking appears in correct place
      if (activeTab === 'pending') {
        // If confirming from pending tab, switch to my-bookings to see the confirmed booking
        setActiveTab('my-bookings');
      }
      loadDashboard();
    } catch (error) {
      showToast('Failed to confirm booking: ' + (error.response?.data?.error || error.message), 'error', 5000);
    }
  };

  const handleEditBooking = (booking) => {
    const newCheckIn = prompt('Enter new check-in date (YYYY-MM-DD):', booking.checkInDate);
    if (!newCheckIn) return;

    const newCheckOut = prompt('Enter new check-out date (YYYY-MM-DD) or leave empty:', booking.checkOutDate || '');
    const newGuests = prompt('Enter number of guests:', booking.numberOfGuests);
    if (!newGuests) return;

    const updateData = {
      checkInDate: newCheckIn,
      checkOutDate: newCheckOut || null,
      numberOfGuests: parseInt(newGuests),
    };

    bookingService.updateBooking(booking.id, updateData)
      .then(() => {
        showToast('Booking updated successfully!', 'success', 3000);
        loadDashboard();
      })
      .catch((error) => {
        showToast('Failed to update booking: ' + (error.response?.data?.error || error.message), 'error', 5000);
      });
  };

  const handleCompleteBooking = async (bookingId) => {
    if (!window.confirm('Mark this booking as completed?')) return;
    
    try {
      await bookingService.completeBooking(bookingId);
      showToast('Booking marked as completed!', 'success', 3000);
      loadDashboard();
    } catch (error) {
      showToast('Failed to complete booking: ' + (error.response?.data?.error || error.message), 'error', 5000);
    }
  };

  const handleFinalizeBooking = async (bookingId) => {
    const notes = prompt('Enter finalization notes (optional):');
    if (notes === null) return; // User cancelled
    
    try {
      await bookingService.finalizeBooking(bookingId, notes || null);
      showToast('Booking finalized successfully!', 'success', 3000);
      loadDashboard();
    } catch (error) {
      showToast('Failed to finalize booking: ' + (error.response?.data?.error || error.message), 'error', 5000);
    }
  };

  if (!user || !user.isAgent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white">
        <Navbar openAuth={() => setIsOpen(true)} />
        <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="mx-auto text-red-600 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need to be an approved agent to access this page.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white flex flex-col">
      <Navbar openAuth={() => setIsOpen(true)} />
      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Dashboard</h1>
          <p className="text-gray-600">Manage your bookings and help travelers</p>
        </div>

        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'pending'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending Bookings
            {pendingBookings.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {pendingBookings.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'my-bookings'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            My Bookings
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'clients'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Clients
          </button>
          <button
            onClick={() => navigate('/agent/packages')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Packages
          </button>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <BookingCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200 transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <Briefcase className="text-purple-600" size={28} />
                      <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center opacity-50"></div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalBookings}</div>
                    <div className="text-sm text-gray-600 font-medium">Total Bookings</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-lg p-6 border border-yellow-200 transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="text-yellow-600" size={28} />
                      <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center opacity-50"></div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.pendingBookings}</div>
                    <div className="text-sm text-gray-600 font-medium">Pending</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200 transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle className="text-green-600" size={28} />
                      <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center opacity-50"></div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.confirmedBookings}</div>
                    <div className="text-sm text-gray-600 font-medium">Confirmed</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200 transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="text-blue-600" size={28} />
                      <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center opacity-50"></div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">${stats.totalRevenue?.toFixed(2) || '0.00'}</div>
                    <div className="text-sm text-gray-600 font-medium">Total Revenue</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Recent Bookings</h3>
                    <button
                      onClick={() => setActiveTab('my-bookings')}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  {myBookings.length === 0 ? (
                    <EmptyBookingsAgent />
                  ) : (
                    <div className="space-y-4">
                      {myBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-gray-900">{booking.destination.name}</h4>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                  booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {booking.status}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex items-center gap-2">
                                  <MapPin size={14} />
                                  {booking.destination.city}, {booking.destination.country}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} />
                                  {booking.checkInDate} {booking.checkOutDate && `- ${booking.checkOutDate}`}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users size={14} />
                                  {booking.numberOfGuests} guests
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-900">${booking.totalPrice}</div>
                              {booking.status === 'PENDING' && (
                                <button
                                  onClick={() => handleConfirmBooking(booking.id)}
                                  className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                                >
                                  Confirm
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                            {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                              <button
                                onClick={() => handleEditBooking(booking)}
                                className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition flex items-center gap-1"
                              >
                                <Pencil size={14} />
                                Edit
                              </button>
                            )}
                            {booking.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleCompleteBooking(booking.id)}
                                className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition flex items-center gap-1"
                              >
                                <CheckCircle size={14} />
                                Complete
                              </button>
                            )}
                            {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                              <button
                                onClick={() => handleFinalizeBooking(booking.id)}
                                className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition flex items-center gap-1"
                              >
                                <Check size={14} />
                                Finalize
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'pending' && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Pending Bookings Needing Assignment</h3>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <BookingCardSkeleton key={i} />
                    ))}
                  </div>
                ) : pendingBookings.length === 0 ? (
                  <EmptyBookingsAgent />
                ) : (
                  <div className="space-y-4">
                    {pendingBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{booking.destination.name}</h4>
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
                                PENDING
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1 mb-3">
                              <div className="flex items-center gap-2">
                                <MapPin size={14} />
                                {booking.destination.city}, {booking.destination.country}
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar size={14} />
                                {booking.checkInDate} {booking.checkOutDate && `- ${booking.checkOutDate}`}
                              </div>
                              <div className="flex items-center gap-2">
                                <Users size={14} />
                                {booking.numberOfGuests} guests
                              </div>
                              {booking.specialRequests && (
                                <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                                  <strong>Special Requests:</strong> {booking.specialRequests}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Customer: {booking.user.email}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-xl font-bold text-gray-900 mb-2">${booking.totalPrice}</div>
                            <button
                              onClick={() => handleAssignBooking(booking.id)}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                            >
                              Assign to Me
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'my-bookings' && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">My Assigned Bookings</h3>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <BookingCardSkeleton key={i} />
                    ))}
                  </div>
                ) : myBookings.length === 0 ? (
                  <EmptyBookingsAgent />
                ) : (
                  <div className="space-y-4">
                    {myBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{booking.destination.name}</h4>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1 mb-3">
                              <div className="flex items-center gap-2">
                                <MapPin size={14} />
                                {booking.destination.city}, {booking.destination.country}
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar size={14} />
                                {booking.checkInDate} {booking.checkOutDate && `- ${booking.checkOutDate}`}
                              </div>
                              <div className="flex items-center gap-2">
                                <Users size={14} />
                                {booking.numberOfGuests} guests
                              </div>
                              {booking.specialRequests && (
                                <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                                  <strong>Special Requests:</strong> {booking.specialRequests}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Customer: {booking.user.email} | {booking.user.firstName} {booking.user.lastName}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-xl font-bold text-gray-900 mb-2">${booking.totalPrice}</div>
                            {booking.status === 'PENDING' && (
                              <button
                                onClick={() => handleConfirmBooking(booking.id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                              >
                                Confirm Booking
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                          {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleEditBooking(booking)}
                              className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition flex items-center gap-1"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>
                          )}
                          {booking.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleCompleteBooking(booking.id)}
                              className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition flex items-center gap-1"
                            >
                              <CheckCircle size={14} />
                              Complete
                            </button>
                          )}
                          {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                            <button
                              onClick={() => handleFinalizeBooking(booking.id)}
                              className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition flex items-center gap-1"
                            >
                              <Check size={14} />
                              Finalize
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'clients' && (
              <ClientPortfolio />
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AgentDashboard;

