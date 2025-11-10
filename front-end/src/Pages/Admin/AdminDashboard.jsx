import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { 
    Users, 
    UserCheck, 
    UserX, 
    Activity, 
    Shield, 
    LogOut,
    Search,
    Trash2,
    Ban,
    CheckCircle,
    AlertCircle,
    Clock,
    TrendingUp
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAdminAccess();
        loadDashboardData();
    }, []);

    const checkAdminAccess = () => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/');
            return;
        }
        
        try {
            const user = JSON.parse(userData);
            if (!user.isAdmin) {
                navigate('/');
            }
        } catch (e) {
            navigate('/');
        }
    };

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            
            const [statsRes, usersRes] = await Promise.all([
                api.get('/api/admin/stats'),
                api.get('/api/admin/users')
            ]);
            
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setError(null);
        } catch (err) {
            console.error('Error loading dashboard:', err);
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleSuspendUser = async (userId) => {
        if (!window.confirm('Are you sure you want to suspend this user?')) return;
        
        try {
            await api.post(`/api/admin/users/${userId}/suspend`);
            loadDashboardData();
        } catch (err) {
            alert(err.message || 'Failed to suspend user');
        }
    };

    const handleActivateUser = async (userId) => {
        try {
            await api.post(`/api/admin/users/${userId}/activate`);
            loadDashboardData();
        } catch (err) {
            alert(err.message || 'Failed to activate user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to DELETE this user? This action cannot be undone!')) return;
        
        try {
            await api.delete(`/api/admin/users/${userId}`);
            loadDashboardData();
        } catch (err) {
            alert(err.message || 'Failed to delete user');
        }
    };

    const handleViewDetails = (userId) => {
        navigate(`/admin/users/${userId}`);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesFilter = filterStatus === 'ALL' || user.status === filterStatus;
        
        return matchesSearch && matchesFilter;
    });

    const getStatusBadge = (status) => {
        const styles = {
            ACTIVE: 'bg-green-100 text-green-800 border-green-300',
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            SUSPENDED: 'bg-red-100 text-red-800 border-red-300',
        };
        return styles[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <div className="bg-white shadow-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                                <Shield className="text-white" size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                                <p className="text-sm text-gray-600">User Management & Analytics</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-300 rounded-lg p-4 flex items-center space-x-3">
                        <AlertCircle className="text-red-600" size={24} />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Total Users</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                                </div>
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <Users className="text-blue-600" size={28} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Active Users</p>
                                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeUsers}</p>
                                </div>
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <UserCheck className="text-green-600" size={28} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Suspended</p>
                                    <p className="text-3xl font-bold text-red-600 mt-2">{stats.suspendedUsers}</p>
                                </div>
                                <div className="bg-red-100 p-3 rounded-lg">
                                    <UserX className="text-red-600" size={28} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Pending</p>
                                    <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingUsers}</p>
                                </div>
                                <div className="bg-yellow-100 p-3 rounded-lg">
                                    <Clock className="text-yellow-600" size={28} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Management Section */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">User Management</h2>
                        
                        {/* Search and Filter */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by email or name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="ALL">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="PENDING">Pending</option>
                                <option value="SUSPENDED">Suspended</option>
                            </select>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center space-y-3">
                                                <Users className="text-gray-400" size={48} />
                                                <p className="text-gray-500 font-medium">
                                                    {users.length === 0 
                                                        ? 'No users registered yet' 
                                                        : 'No users match your search criteria'}
                                                </p>
                                                {users.length === 0 && (
                                                    <p className="text-sm text-gray-400">
                                                        Users will appear here once they register
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {user.firstName && user.lastName 
                                                            ? `${user.firstName} ${user.lastName}` 
                                                            : 'No Name'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(user.status)}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.isVerified ? (
                                                    <CheckCircle className="text-green-600" size={20} />
                                                ) : (
                                                    <AlertCircle className="text-yellow-600" size={20} />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(user.lastLogin)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleViewDetails(user.id)}
                                                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                                                    >
                                                        View
                                                    </button>
                                                    {user.status === 'SUSPENDED' ? (
                                                        <button
                                                            onClick={() => handleActivateUser(user.id)}
                                                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                                                        >
                                                            Activate
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleSuspendUser(user.id)}
                                                            className="p-1 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                                                            title="Suspend"
                                                        >
                                                            <Ban size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;