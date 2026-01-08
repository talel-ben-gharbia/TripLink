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
  getCommissions,
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
  Wallet,
  TrendingUp,
} from 'lucide-react';
import ClientPortfolio from './Agent/ClientPortfolio';
import { BookingCardSkeleton, StatsCardSkeleton } from '../Component/LoadingSkeleton';
import { EmptyBookingsAgent, EmptyPackages } from '../Component/EmptyState';
import { useErrorToast } from '../Component/ErrorToast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [commissions, setCommissions] = useState(null);
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
        const [dashboardData, commissionData] = await Promise.all([
          getAgentDashboard(),
          getCommissions(),
        ]);
        setStats(dashboardData.stats);
        setMyBookings(dashboardData.recentBookings || []);
        setCommissions(commissionData);
      } else if (activeTab === 'pending') {
        const data = await getPendingBookings();
        setPendingBookings(data.bookings || []);
      } else if (activeTab === 'my-bookings') {
        const data = await getAgentBookings();
        setMyBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      showToast('Failed to load dashboard data', 'error', 3000);
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
          <button
            onClick={() => navigate('/agent/commissions')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Commissions
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
                {/* Wallet & Commission Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-lg p-6 border border-emerald-200 transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <Wallet className="text-emerald-600" size={28} />
                      <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center opacity-50"></div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      ${parseFloat(commissions?.stats?.totalPaid || 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Wallet Balance</div>
                    <div className="text-xs text-emerald-700 mt-1">Paid Commissions</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-lg p-6 border border-amber-200 transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="text-amber-600" size={28} />
                      <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center opacity-50"></div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      ${parseFloat(commissions?.stats?.totalPending || 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Pending Earnings</div>
                    <div className="text-xs text-amber-700 mt-1">Awaiting Payment</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200 transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <Briefcase className="text-purple-600" size={28} />
                      <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center opacity-50"></div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalBookings}</div>
                    <div className="text-sm text-gray-600 font-medium">Total Bookings</div>
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

                {/* Booking Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-lg p-6 border border-indigo-200 transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="text-indigo-600" size={28} />
                      <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center opacity-50"></div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{commissions?.stats?.paidCount || 0}</div>
                    <div className="text-sm text-gray-600 font-medium">Paid Commissions</div>
                  </div>
                </div>

                {/* Charts Section */}
                {commissions && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Commission Status Pie Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Commission Status
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Paid", value: commissions.stats?.paidCount || 0, color: "#10b981" },
                              { name: "Pending", value: commissions.stats?.pendingCount || 0, color: "#f59e0b" },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {[
                              { name: "Paid", value: commissions.stats?.paidCount || 0, color: "#10b981" },
                              { name: "Pending", value: commissions.stats?.pendingCount || 0, color: "#f59e0b" },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Earnings Overview Bar Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Earnings Overview
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={[
                            {
                              name: "Paid",
                              Amount: parseFloat(commissions.stats?.totalPaid || 0),
                            },
                            {
                              name: "Pending",
                              Amount: parseFloat(commissions.stats?.totalPending || 0),
                            },
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => `$${parseFloat(value).toFixed(2)}`} />
                          <Legend />
                          <Bar dataKey="Amount" fill="#8b5cf6" name="Earnings ($)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
                    <button
                      onClick={() => navigate('/agent/commissions')}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      View All Commissions →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setActiveTab('pending')}
                      className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition text-left"
                    >
                      <Clock className="text-purple-600 mb-2" size={24} />
                      <div className="font-semibold text-gray-900">Pending Bookings</div>
                      <div className="text-sm text-gray-600">{pendingBookings.length} awaiting assignment</div>
                    </button>
                    <button
                      onClick={() => setActiveTab('clients')}
                      className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-left"
                    >
                      <Users className="text-blue-600 mb-2" size={24} />
                      <div className="font-semibold text-gray-900">My Clients</div>
                      <div className="text-sm text-gray-600">Manage client portfolio</div>
                    </button>
                    <button
                      onClick={() => navigate('/agent/packages')}
                      className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition text-left"
                    >
                      <Briefcase className="text-green-600 mb-2" size={24} />
                      <div className="font-semibold text-gray-900">Package Builder</div>
                      <div className="text-sm text-gray-600">Create travel packages</div>
                    </button>
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

