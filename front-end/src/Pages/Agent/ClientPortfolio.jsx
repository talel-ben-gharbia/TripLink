import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Tag, Edit2, Save, X, Phone, Mail, Calendar, DollarSign, Briefcase, Star, Filter } from 'lucide-react';
import api from '../../api';
import ClientMessaging from '../../Component/ClientMessaging';
import { useErrorToast } from '../../Component/ErrorToast';

const ClientPortfolio = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingNotes, setEditingNotes] = useState(null);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const { showToast, ToastContainer } = useErrorToast();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/agent/clients');
      setClients(response.data.clients || []);
    } catch (error) {
      console.error('Failed to load clients:', error);
      // Don't show toast if it's just an empty list (404 or no clients)
      if (error.response?.status !== 404) {
        showToast('Failed to load clients: ' + (error.response?.data?.error || error.message), 'error', 5000);
      }
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const loadClientDetails = async (userId) => {
    try {
      const response = await api.get(`/api/agent/clients/${userId}`);
      if (response.data) {
        setSelectedClient(response.data);
        setNotes(response.data.client?.notes || '');
        setTags(response.data.client?.tags || []);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to load client details:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load client details';
      showToast(errorMessage, 'error', 5000);
      setSelectedClient(null);
    }
  };

  const saveClientNotes = async (userId) => {
    try {
      await api.put(`/api/agent/clients/${userId}`, {
        notes,
        tags
      });
      setEditingNotes(null);
      loadClients();
      if (selectedClient) {
        loadClientDetails(userId);
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
      showToast('Failed to save notes: ' + (error.response?.data?.error || error.message), 'error', 5000);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = !searchQuery || 
      client.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'ALL' || client.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold brand-gradient-text mb-2 flex items-center gap-3">
            <Users size={32} />
            Client Portfolio
          </h1>
          <p className="text-gray-600">Manage your clients and their travel preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clients List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {/* Search and Filter */}
              <div className="mb-4">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>

              {/* Clients List */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="mx-auto mb-2 text-gray-400" size={32} />
                  <p>No clients found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id || client.userId}
                      onClick={() => loadClientDetails(client.userId || client.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition ${
                        selectedClient?.client?.userId === (client.userId || client.id)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {client.firstName} {client.lastName}
                        </h3>
                        {client.status === 'VIP' && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">VIP</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{client.email}</p>
                      {client.tags && client.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {client.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Client Details */}
          <div className="lg:col-span-2">
            {selectedClient ? (
              <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                {/* Client Header */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedClient.user?.firstName || ''} {selectedClient.user?.lastName || ''}
                      </h2>
                      <p className="text-gray-600">{selectedClient.user?.email || ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedClient.client?.status === 'VIP' && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                          VIP Client
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedClient.user?.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={16} />
                        <span>{selectedClient.user.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={16} />
                      <span>{selectedClient.user?.email || ''}</span>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Edit2 size={20} />
                      Notes & Tags
                    </h3>
                    {editingNotes !== selectedClient.client?.userId ? (
                      <button
                        onClick={() => setEditingNotes(selectedClient.client?.userId || selectedClient.user?.id)}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveClientNotes(selectedClient.client?.userId || selectedClient.user?.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1"
                        >
                          <Save size={14} />
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingNotes(null);
                            setNotes(selectedClient.client?.notes || '');
                            setTags(selectedClient.client?.tags || []);
                          }}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm flex items-center gap-1"
                        >
                          <X size={14} />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {editingNotes === (selectedClient.client?.userId || selectedClient.user?.id) ? (
                    <div className="space-y-4">
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes about this client..."
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px]"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                            >
                              {tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="text-blue-700 hover:text-blue-900"
                              >
                                <X size={14} />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addTag()}
                            placeholder="Add tag..."
                            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <button
                            onClick={addTag}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700 whitespace-pre-wrap mb-4">
                        {selectedClient.client?.notes || 'No notes yet. Click Edit to add notes.'}
                      </p>
                      {selectedClient.client?.tags && selectedClient.client.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedClient.client.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Booking History */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase size={20} />
                    Booking History ({selectedClient.bookings?.length || 0})
                  </h3>
                  {selectedClient.bookings && selectedClient.bookings.length > 0 ? (
                    <div className="space-y-3">
                      {selectedClient.bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer"
                          onClick={() => navigate(`/bookings?booking=${booking.id}`)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{booking.destination}</h4>
                              <p className="text-sm text-gray-600">Ref: {booking.bookingReference}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">${parseFloat(booking.totalPrice).toFixed(2)}</p>
                              <span className={`text-xs px-2 py-1 rounded ${
                                booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                      <Briefcase className="mx-auto mb-2 text-gray-400" size={32} />
                      <p>No bookings yet</p>
                    </div>
                  )}
                </div>

                {/* Messaging */}
                <div className="mt-6">
                  <ClientMessaging
                    clientId={selectedClient.user?.id}
                    clientName={`${selectedClient.user?.firstName || ''} ${selectedClient.user?.lastName || ''}`.trim() || selectedClient.user?.email}
                    bookingId={selectedClient.bookings?.[0]?.id}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Users className="mx-auto mb-4 text-gray-400" size={64} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Client</h3>
                <p className="text-gray-600">Choose a client from the list to view their details and booking history</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPortfolio;

