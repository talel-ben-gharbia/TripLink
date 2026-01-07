import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Component/Navbar';
import Footer from '../../Component/Footer';
import AuthModal from '../../Component/AuthModal';
import { getCommissions } from '../../services/agentService';
import { DollarSign, CheckCircle, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { StatsCardSkeleton } from '../../Component/LoadingSkeleton';
import { useErrorToast } from '../../Component/ErrorToast';

const CommissionDashboard = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState([]);
  const [stats, setStats] = useState(null);
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
      loadCommissions();
    }
  }, [user]);

  const loadCommissions = async () => {
    setLoading(true);
    try {
      const data = await getCommissions();
      setCommissions(data.commissions || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error loading commissions:', error);
      showToast('Failed to load commissions: ' + (error.response?.data?.error || error.message), 'error', 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-bg flex flex-col">
      <ToastContainer />
      <Navbar openAuth={() => setIsOpen(true)} />
      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Commission Dashboard</h1>
          <p className="text-gray-600">Track your earnings and commissions</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="text-green-600" size={28} />
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center opacity-50"></div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">${parseFloat(stats.totalPaid || 0).toFixed(2)}</div>
              <div className="text-sm text-gray-600 font-medium">Total Paid</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-lg p-6 border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <Clock className="text-yellow-600" size={28} />
                <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center opacity-50"></div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">${parseFloat(stats.totalPending || 0).toFixed(2)}</div>
              <div className="text-sm text-gray-600 font-medium">Pending</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="text-blue-600" size={28} />
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center opacity-50"></div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.paidCount || 0}</div>
              <div className="text-sm text-gray-600 font-medium">Paid Commissions</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="text-purple-600" size={28} />
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center opacity-50"></div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.pendingCount || 0}</div>
              <div className="text-sm text-gray-600 font-medium">Pending Commissions</div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Commission History</h2>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="mx-auto animate-spin text-purple-600" size={48} />
            </div>
          ) : commissions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No commissions yet. Commissions are created when you confirm bookings.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Booking</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Destination</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Percentage</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Paid Date</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((commission) => (
                    <tr key={commission.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-purple-600">#{commission.bookingReference}</span>
                      </td>
                      <td className="py-3 px-4">{commission.destination}</td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">${parseFloat(commission.amount).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{commission.percentage}%</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          commission.status === 'PAID' ? 'bg-green-100 text-green-700' :
                          commission.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {commission.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {commission.paidAt ? new Date(commission.paidAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CommissionDashboard;


