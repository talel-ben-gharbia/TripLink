import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import {
    Users,
    UserCheck,
    UserX,
    Shield,
    LogOut,
    Search,
    Trash2,
    Ban,
    CheckCircle,
    AlertCircle,
    Clock,
    MapPin,
    Star,
    Plus,
    Pencil,
    X,
    Globe,
    Folder
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [destModalOpen, setDestModalOpen] = useState(false);
    const [editingDestination, setEditingDestination] = useState(null);
    const [destinationForm, setDestinationForm] = useState({ name: '', city: '', country: '', category: '', image: '', priceMin: '', priceMax: '', rating: '' });
    const [imageValid, setImageValid] = useState(null);
    const [imageChecking, setImageChecking] = useState(false);
    const [savingDestination, setSavingDestination] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const tabsList = useMemo(() => ['overview', 'users', 'destinations'], []);
    const destMetrics = useMemo(() => {
        const list = destinations || [];
        const total = list.length;
        let ratingSum = 0;
        let ratingCount = 0;
        let minPrice = null;
        let maxPrice = null;
        const categories = new Map();
        const countries = new Set();
        for (const d of list) {
            if (typeof d.rating === 'number') {
                ratingSum += d.rating;
                ratingCount += 1;
            }
            const prices = [d.priceMin, d.priceMax, d.price].filter((v) => typeof v === 'number');
            for (const p of prices) {
                if (minPrice === null || p < minPrice) minPrice = p;
                if (maxPrice === null || p > maxPrice) maxPrice = p;
            }
            if (d.category) categories.set(d.category, (categories.get(d.category) || 0) + 1);
            if (d.country) countries.add(d.country);
        }
        const avgRating = ratingCount ? (ratingSum / ratingCount) : null;
        let topCategory = '';
        let topCount = 0;
        categories.forEach((count, name) => { if (count > topCount) { topCount = count; topCategory = name; } });
        return {
            total,
            avgRating,
            minPrice,
            maxPrice,
            categoriesCount: categories.size,
            countriesCount: countries.size,
            topCategory
        };
    }, [destinations]);

    const checkAdminAccess = React.useCallback(() => {
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
    }, [navigate]);

    const loadDashboardDataMemo = React.useCallback(() => loadDashboardData(), []);

    useEffect(() => {
        checkAdminAccess();
        loadDashboardDataMemo();
    }, [checkAdminAccess, loadDashboardDataMemo]);



    const loadDashboardData = async () => {
        try {
            setLoading(true);

            const [statsRes, usersRes, destinationsRes] = await Promise.all([
                api.get('/api/admin/stats'),
                api.get('/api/admin/users'),
                api.get('/api/admin/destinations')
            ]);

            setStats(statsRes.data);
            setUsers(usersRes.data);
            setDestinations(destinationsRes.data || []);
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

    const openCreateDestination = () => {
        setEditingDestination(null);
        setDestinationForm({ name: '', city: '', country: '', category: '', image: '', priceMin: '', priceMax: '', rating: '' });
        setImageValid(null);
        setImageChecking(false);
        setDestModalOpen(true);
    };

    const openEditDestination = (d) => {
        setEditingDestination(d);
        setDestinationForm({
            name: d.name || '',
            city: d.city || '',
            country: d.country || '',
            category: d.category || '',
            image: d.image || '',
            priceMin: d.priceMin ?? '',
            priceMax: d.priceMax ?? '',
            rating: d.rating ?? ''
        });
        setImageValid(d.image ? true : null);
        setImageChecking(false);
        setDestModalOpen(true);
    };

    const closeDestModal = () => {
        setDestModalOpen(false);
        setEditingDestination(null);
    };

    const submitDestination = async () => {
        try {
            setSavingDestination(true);
            if (destinationForm.image && imageValid === false) {
                setError('Please provide a valid image URL');
                setSavingDestination(false);
                return;
            }
            const payload = {
                name: destinationForm.name,
                city: destinationForm.city,
                country: destinationForm.country,
                category: destinationForm.category,
                images: destinationForm.image ? [destinationForm.image] : [],
                priceMin: destinationForm.priceMin ? Number(destinationForm.priceMin) : undefined,
                priceMax: destinationForm.priceMax ? Number(destinationForm.priceMax) : undefined,
                rating: destinationForm.rating ? Number(destinationForm.rating) : undefined
            };
            if (editingDestination && editingDestination.id) {
                await api.put(`/api/admin/destinations/${editingDestination.id}`, payload);
            } else {
                await api.post('/api/admin/destinations', payload);
            }
            setDestModalOpen(false);
            await loadDashboardData();
        } catch (err) {
            setError(err.message || 'Failed to save destination');
        } finally {
            setSavingDestination(false);
        }
    };

    const handleDeleteDestination = async (id) => {
        if (!window.confirm('Are you sure you want to delete this destination?')) return;
        try {
            await api.delete(`/api/admin/destinations/${id}`);
            await loadDashboardData();
        } catch (err) {
            alert(err.message || 'Failed to delete destination');
        }
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

    const handleTabKeyDown = (e) => {
        const currentIndex = tabsList.indexOf(activeTab);
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            const next = tabsList[(currentIndex + 1) % tabsList.length];
            setActiveTab(next);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const prev = tabsList[(currentIndex - 1 + tabsList.length) % tabsList.length];
            setActiveTab(prev);
        } else if (e.key === 'Home') {
            e.preventDefault();
            setActiveTab(tabsList[0]);
        } else if (e.key === 'End') {
            e.preventDefault();
            setActiveTab(tabsList[tabsList.length - 1]);
        }
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
                        <div className="flex items-center gap-3">
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
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-300 rounded-lg p-4 flex items-center space-x-3">
                        <AlertCircle className="text-red-600" size={24} />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}





                {destModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/40" onClick={closeDestModal}></div>
                        <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl border p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">{editingDestination ? 'Edit Destination' : 'Add Destination'}</h3>
                                <button type="button" onClick={closeDestModal} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <input type="text" value={destinationForm.name} onChange={(e) => setDestinationForm({ ...destinationForm, name: e.target.value })} placeholder="Name" className="w-full px-3 py-2 border rounded-lg" />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" value={destinationForm.city} onChange={(e) => setDestinationForm({ ...destinationForm, city: e.target.value })} placeholder="City" className="w-full px-3 py-2 border rounded-lg" />
                                    <input type="text" value={destinationForm.country} onChange={(e) => setDestinationForm({ ...destinationForm, country: e.target.value })} placeholder="Country" className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                                <input type="text" value={destinationForm.category} onChange={(e) => setDestinationForm({ ...destinationForm, category: e.target.value })} placeholder="Category" className="w-full px-3 py-2 border rounded-lg" />
                                <div>
                                    <input type="url" value={destinationForm.image} onChange={(e) => {
                                        const url = e.target.value;
                                        setDestinationForm({ ...destinationForm, image: url });
                                        if (!url) { setImageValid(null); return; }
                                        const ok = /^https?:\/\//i.test(url);
                                        if (!ok) { setImageValid(false); return; }
                                        setImageChecking(true);
                                        const img = new Image();
                                        img.onload = () => { setImageValid(true); setImageChecking(false); };
                                        img.onerror = () => { setImageValid(false); setImageChecking(false); };
                                        img.src = url;
                                    }} placeholder="Image URL" className="w-full px-3 py-2 border rounded-lg" />
                                    <div className="mt-1 text-xs">
                                        {imageChecking && (<span className="text-gray-500">Checking image…</span>)}
                                        {imageValid === true && !imageChecking && (<span className="text-green-600">Valid image</span>)}
                                        {imageValid === false && !imageChecking && (<span className="text-red-600">Invalid image URL</span>)}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="number" value={destinationForm.priceMin} onChange={(e) => setDestinationForm({ ...destinationForm, priceMin: e.target.value })} placeholder="Price Min" className="w-full px-3 py-2 border rounded-lg" />
                                    <input type="number" value={destinationForm.priceMax} onChange={(e) => setDestinationForm({ ...destinationForm, priceMax: e.target.value })} placeholder="Price Max" className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                                <input type="number" step="0.1" value={destinationForm.rating} onChange={(e) => setDestinationForm({ ...destinationForm, rating: e.target.value })} placeholder="Rating" className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div className="mt-6 flex items-center justify-end gap-3">
                                <button type="button" onClick={closeDestModal} className="px-4 py-2 rounded-lg border">Cancel</button>
                                <button type="button" onClick={submitDestination} disabled={savingDestination} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
                                    {savingDestination ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200">
                    <div className="sticky top-0 bg-white z-10 -mx-6 px-6 mb-6 border-b pb-4 shadow-sm">
                        <div className="flex gap-4 overflow-x-auto whitespace-nowrap" role="tablist" aria-label="Admin sections" onKeyDown={handleTabKeyDown}>
                            {tabsList.map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-3 px-6 capitalize font-semibold transition-all rounded-t-lg ${activeTab === tab
                                        ? 'border-b-4 border-blue-600 text-blue-600 bg-blue-50'
                                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                                        }`}
                                    role="tab"
                                    aria-selected={activeTab === tab}
                                    aria-controls={`panel-${tab}`}
                                    id={tab}
                                >
                                    {tab === 'users' ? (
                                        <span className="inline-flex items-center">
                                            users
                                            {stats && (
                                                <span className="ml-2 inline-flex items-center justify-center min-w-[24px] h-5 px-2 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                                    {stats.activeUsers}
                                                </span>
                                            )}
                                        </span>
                                    ) : tab === 'destinations' ? (
                                        <span className="inline-flex items-center">
                                            destinations
                                            {destinations && (
                                                <span className="ml-2 inline-flex items-center justify-center min-w-[24px] h-5 px-2 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                                    {destinations.length}
                                                </span>
                                            )}
                                        </span>
                                    ) : (
                                        tab
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {activeTab === 'overview' && stats && (
                    <div id="panel-overview" role="tabpanel" aria-labelledby="overview" className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Total Destinations</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{destMetrics.total}</p>
                                    </div>
                                    <div className="bg-purple-100 p-3 rounded-lg">
                                        <Globe className="text-purple-600" size={28} />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Avg Rating</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{destMetrics.avgRating ? destMetrics.avgRating.toFixed(1) : '—'}</p>
                                    </div>
                                    <div className="bg-yellow-100 p-3 rounded-lg">
                                        <Star className="text-yellow-600" size={28} />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Categories</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{destMetrics.categoriesCount}</p>
                                    </div>
                                    <div className="bg-indigo-100 p-3 rounded-lg">
                                        <Folder className="text-indigo-600" size={28} />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Countries</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{destMetrics.countriesCount}</p>
                                    </div>
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <MapPin className="text-blue-600" size={28} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Recent Users</h3>
                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border">{users.length}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(users || []).slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 6).map(u => (
                                    <div key={u.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border hover:bg-white transition">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                            {(u.firstName?.[0] || '').toUpperCase()}{(u.lastName?.[0] || '').toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">{u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : (u.email || 'User')}</div>
                                            <div className="text-xs text-gray-600">{u.email}</div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs border ${u.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : u.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : u.status === 'SUSPENDED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>{u.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Recent Destinations</h3>
                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border">{destinations.length}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(destinations || []).slice().slice(0, 6).map(d => (
                                    <div key={d.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border hover:bg-white transition">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200">
                                            <img src={d.image || ''} alt={d.name || ''} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400'; }} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">{d.name}</div>
                                            <div className="text-xs text-gray-600">{d.city ? `${d.city}, ${d.country}` : d.country}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {typeof d.rating === 'number' && (
                                                <span className="px-2 py-1 rounded-full text-xs bg-yellow-50 text-yellow-700 border border-yellow-200">{d.rating}</span>
                                            )}
                                            {d.category && (
                                                <span className="px-2 py-1 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">{d.category}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'destinations' && (
                    <div id="panel-destinations" role="tabpanel" aria-labelledby="destinations" className="bg-white rounded-xl shadow-lg border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Destinations</h2>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 rounded-full text-xs bg-purple-50 text-purple-700 border border-purple-200">{destinations.length}</span>
                                    <button type="button" onClick={openCreateDestination} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700">
                                        <Plus size={16} />
                                        <span>Add</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            {destinations.length === 0 ? (
                                <div className="text-center text-gray-600">No destinations found</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {destinations.map((d) => {
                                        const priceText = d.priceMin && d.priceMax ? `$${d.priceMin} – $${d.priceMax}` : (d.priceMin ? `$${d.priceMin}` : (d.price ? `$${d.price}` : ''));
                                        return (
                                            <div key={d.id} className="bg-white rounded-2xl shadow-md border overflow-hidden flex flex-col hover:shadow-lg transition">
                                                <div className="relative aspect-[4/3]">
                                                    <img src={d.image || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200'} alt={d.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=1200&auto=format&fit=crop&q=80'; }} />
                                                    {d.rating && (
                                                        <div className="absolute bottom-3 left-3 inline-flex items-center px-2.5 py-1 rounded-md bg-white/90 text-gray-900 shadow">
                                                            <Star size={14} className="text-yellow-500 mr-1" />
                                                            <span className="text-xs font-semibold">{d.rating}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-4 flex flex-col gap-2 flex-1">
                                                    <div className="text-sm text-gray-600 inline-flex items-center">
                                                        <MapPin size={14} className="mr-1 text-gray-500" />
                                                        {d.city ? `${d.city}, ${d.country}` : d.country}
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900">{d.name}</h3>
                                                    {d.category && (<div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border self-start">{d.category}</div>)}
                                                    {priceText && (
                                                        <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <span className="text-xs font-semibold">{priceText}</span>
                                                        </div>
                                                    )}
                                                    <div className="mt-auto flex items-center justify-between pt-2">
                                                        <div className="flex items-center gap-2">
                                                            <button type="button" onClick={() => navigate(`/destinations/${d.id}`)} className="px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow hover:opacity-90">View</button>
                                                            <button type="button" onClick={() => openEditDestination(d)} className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800 border hover:bg-gray-200">
                                                                <Pencil size={16} />
                                                            </button>
                                                        </div>
                                                        <button type="button" onClick={() => handleDeleteDestination(d.id)} className="px-3 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div id="panel-users" role="tabpanel" aria-labelledby="users" className="bg-white rounded-xl shadow-lg border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                                {stats && (
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">Active: {stats.activeUsers}</span>
                                        <span className="px-2 py-1 rounded-full text-xs bg-gray-50 text-gray-700 border">Total: {stats.totalUsers}</span>
                                    </div>
                                )}
                            </div>

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
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
