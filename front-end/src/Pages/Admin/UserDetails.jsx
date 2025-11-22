import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { 
    ArrowLeft,
    User,
    Mail,
    Phone,
    Activity,
    Shield,
    CheckCircle,
    XCircle,
    MapPin,
    AlertTriangle,
    Ban,
    Trash2,
    RefreshCw
} from 'lucide-react';

const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const checkAdminAccess = React.useCallback(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/');
            return;
        }
        try {
            const currentUser = JSON.parse(userData);
            if (!currentUser.isAdmin) {
                navigate('/');
            }
        } catch (e) {
            navigate('/');
        }
    }, [navigate]);

    const loadUserDetails = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/admin/users/${id}`);
            setUser(response.data);
            setError(null);
        } catch (err) {
            console.error('Error loading user details:', err);
            setError(err.message || 'Failed to load user details');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        checkAdminAccess();
        loadUserDetails();
    }, [checkAdminAccess, loadUserDetails]);

    const handleSuspend = async () => {
        if (!window.confirm('Are you sure you want to suspend this user?')) return;
        
        try {
            await api.post(`/api/admin/users/${id}/suspend`);
            loadUserDetails();
        } catch (err) {
            alert(err.message || 'Failed to suspend user');
        }
    };

    const handleActivate = async () => {
        try {
            await api.post(`/api/admin/users/${id}/activate`);
            loadUserDetails();
        } catch (err) {
            alert(err.message || 'Failed to activate user');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to DELETE this user? This action cannot be undone!')) return;
        
        try {
            await api.delete(`/api/admin/users/${id}`);
            navigate('/admin');
        } catch (err) {
            alert(err.message || 'Failed to delete user');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            ACTIVE: 'text-green-600 bg-green-100 border-green-300',
            PENDING: 'text-yellow-600 bg-yellow-100 border-yellow-300',
            SUSPENDED: 'text-red-600 bg-red-100 border-red-300',
        };
        return colors[status] || 'text-gray-600 bg-gray-100 border-gray-300';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading user details...</p>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
                    <AlertTriangle className="text-red-600 mx-auto mb-4" size={48} />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Error</h2>
                    <p className="text-gray-600 text-center mb-4">{error || 'User not found'}</p>
                    <button
                        onClick={() => navigate('/admin')}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <div className="bg-white shadow-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/admin')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
                                <p className="text-sm text-gray-600">Complete user information and activity</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={loadUserDetails}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* User Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                            <div className="text-center mb-6">
                                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <User className="text-white" size={48} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    {user.firstName && user.lastName 
                                        ? `${user.firstName} ${user.lastName}` 
                                        : 'No Name'}
                                </h2>
                                <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold border ${getStatusColor(user.status)}`}>
                                    {user.status}
                                </span>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center space-x-3 text-gray-700">
                                    <Mail size={20} className="text-gray-400" />
                                    <span className="text-sm">{user.email}</span>
                                </div>
                                {user.phone && (
                                    <div className="flex items-center space-x-3 text-gray-700">
                                        <Phone size={20} className="text-gray-400" />
                                        <span className="text-sm">{user.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center space-x-3 text-gray-700">
                                    {user.isVerified ? (
                                        <CheckCircle size={20} className="text-green-600" />
                                    ) : (
                                        <XCircle size={20} className="text-red-600" />
                                    )}
                                    <span className="text-sm">
                                        {user.isVerified ? 'Email Verified' : 'Email Not Verified'}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2">
                                {user.status === 'SUSPENDED' ? (
                                    <button
                                        onClick={handleActivate}
                                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <CheckCircle size={18} />
                                        <span>Activate User</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSuspend}
                                        className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <Ban size={18} />
                                        <span>Suspend User</span>
                                    </button>
                                )}
                                <button
                                    onClick={handleDelete}
                                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                                >
                                    <Trash2 size={18} />
                                    <span>Delete User</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Details and Activity */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Account Information */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                <Shield size={24} className="text-blue-600" />
                                <span>Account Information</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">User ID</p>
                                    <p className="font-semibold text-gray-900">#{user.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Created At</p>
                                    <p className="font-semibold text-gray-900">{formatDate(user.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Last Login</p>
                                    <p className="font-semibold text-gray-900">{formatDate(user.lastLogin)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                                    <p className="font-semibold text-gray-900">{formatDate(user.updatedAt)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Login Attempts</p>
                                    <p className="font-semibold text-gray-900">{user.loginAttempts || 0}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Token Version</p>
                                    <p className="font-semibold text-gray-900">{user.tokenVersion}</p>
                                </div>
                            </div>
                        </div>

                        {/* Login Statistics */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                <Activity size={24} className="text-blue-600" />
                                <span>Login Statistics</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <p className="text-sm text-blue-600 mb-1">Total Attempts</p>
                                    <p className="text-2xl font-bold text-blue-900">{user.totalLoginAttempts || 0}</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                    <p className="text-sm text-green-600 mb-1">Successful</p>
                                    <p className="text-2xl font-bold text-green-900">{user.successfulLogins || 0}</p>
                                </div>
                                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                    <p className="text-sm text-red-600 mb-1">Failed</p>
                                    <p className="text-2xl font-bold text-red-900">{user.failedLogins || 0}</p>
                                </div>
                            </div>

                            {/* Login History */}
                            <h4 className="font-semibold text-gray-900 mb-3">Recent Login History</h4>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {user.loginAttemptHistory && user.loginAttemptHistory.length > 0 ? (
                                    user.loginAttemptHistory.map((attempt, index) => (
                                        <div 
                                            key={attempt.id || index} 
                                            className={`p-3 rounded-lg border ${
                                                attempt.success 
                                                    ? 'bg-green-50 border-green-200' 
                                                    : 'bg-red-50 border-red-200'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    {attempt.success ? (
                                                        <CheckCircle size={20} className="text-green-600" />
                                                    ) : (
                                                        <XCircle size={20} className="text-red-600" />
                                                    )}
                                                    <div>
                                                        <p className={`font-semibold ${
                                                            attempt.success ? 'text-green-900' : 'text-red-900'
                                                        }`}>
                                                            {attempt.success ? 'Successful Login' : 'Failed Login'}
                                                        </p>
                                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                            <MapPin size={14} />
                                                            <span>{attempt.ipAddress}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600">{formatDate(attempt.attemptedAt)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No login history available</p>
                                )}
                            </div>
                        </div>

                        {/* User Preferences */}
                        {user.preferences && (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">User Preferences</h3>
                                <div className="space-y-4">
                                    {user.preferences.travelStyles && user.preferences.travelStyles.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">Travel Styles</p>
                                            <div className="flex flex-wrap gap-2">
                                                {user.preferences.travelStyles.map((style, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                                        {style}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {user.preferences.interests && user.preferences.interests.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">Interests</p>
                                            <div className="flex flex-wrap gap-2">
                                                {user.preferences.interests.map((interest, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                                        {interest}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {user.preferences.budgetRange && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Budget Range</p>
                                            <p className="font-semibold text-gray-900">{user.preferences.budgetRange}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Profile Completion</p>
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-600 h-2 rounded-full transition-all" 
                                                    style={{ width: `${user.preferences.profileCompletion || 0}%` }}
                                                ></div>
                                            </div>
                                            <span className="font-semibold text-gray-900">
                                                {user.preferences.profileCompletion || 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetails;
