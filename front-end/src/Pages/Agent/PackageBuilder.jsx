import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, X, MapPin, Calendar, Users, DollarSign, Loader2, Package as PackageIcon } from 'lucide-react';
import api from '../../api';
import * as destinationService from '../../services/destinationService';
import { useErrorToast } from '../../Component/ErrorToast';

const PackageBuilder = () => {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useErrorToast();
  const [packages, setPackages] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [packageName, setPackageName] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({ title: '', description: '', cost: 0 });
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  useEffect(() => {
    loadPackages();
    loadDestinations();
  }, []);

  useEffect(() => {
    if (selectedDestinations.length > 0 || startDate || endDate) {
      calculatePrice();
    }
  }, [selectedDestinations, startDate, endDate, numberOfGuests]);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/agent/packages');
      setPackages(response.data.packages || []);
    } catch (error) {
      console.error('Failed to load packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDestinations = async () => {
    try {
      const data = await destinationService.getDestinations();
      setDestinations(data || []);
    } catch (error) {
      console.error('Failed to load destinations:', error);
    }
  };

  const calculatePrice = async () => {
    if (selectedDestinations.length === 0) {
      setCalculatedPrice(0);
      return;
    }

    try {
      const response = await api.post('/api/agent/packages/calculate-price', {
        destinations: selectedDestinations,
        startDate: startDate || null,
        endDate: endDate || null,
        numberOfGuests
      });
      setCalculatedPrice(response.data.totalPrice || 0);
    } catch (error) {
      console.error('Failed to calculate price:', error);
    }
  };

  const addDestination = (destinationId) => {
    if (!selectedDestinations.includes(destinationId)) {
      setSelectedDestinations([...selectedDestinations, destinationId]);
    }
  };

  const removeDestination = (destinationId) => {
    setSelectedDestinations(selectedDestinations.filter(id => id !== destinationId));
  };

  const addActivity = () => {
    if (!newActivity.title.trim()) return;
    setActivities([...activities, { ...newActivity, id: Date.now() }]);
    setNewActivity({ title: '', description: '', cost: 0 });
  };

  const removeActivity = (id) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  const savePackage = async () => {
    if (!packageName.trim() || selectedDestinations.length === 0) {
      showToast('Please provide a package name and select at least one destination', 'warning', 4000);
      return;
    }

    setSaving(true);
    try {
      const packageData = {
        name: packageName,
        description: packageDescription,
        destinations: selectedDestinations,
        activities: activities.map(a => ({ title: a.title, description: a.description, cost: a.cost })),
        startDate: startDate || null,
        endDate: endDate || null,
        numberOfGuests,
        status: 'DRAFT'
      };

      if (editingPackage) {
        await api.put(`/api/agent/packages/${editingPackage.id}`, packageData);
      } else {
        await api.post('/api/agent/packages', packageData);
      }

      showToast('Package saved successfully!', 'success', 3000);
      resetForm();
      loadPackages();
      setShowBuilder(false);
    } catch (error) {
      console.error('Failed to save package:', error);
      showToast('Failed to save package: ' + (error.response?.data?.error || error.message), 'error', 5000);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setPackageName('');
    setPackageDescription('');
    setSelectedDestinations([]);
    setStartDate('');
    setEndDate('');
    setNumberOfGuests(2);
    setActivities([]);
    setEditingPackage(null);
  };

  const editPackage = (pkg) => {
    setEditingPackage(pkg);
    setPackageName(pkg.name);
    setPackageDescription(pkg.description || '');
    setSelectedDestinations(pkg.destinations || []);
    setStartDate(pkg.startDate || '');
    setEndDate(pkg.endDate || '');
    setNumberOfGuests(pkg.numberOfGuests || 2);
    setActivities(pkg.activities || []);
    setShowBuilder(true);
  };

  const deletePackage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;

    try {
      await api.delete(`/api/agent/packages/${id}`);
      loadPackages();
    } catch (error) {
      console.error('Failed to delete package:', error);
      showToast('Failed to delete package: ' + (error.response?.data?.error || error.message), 'error', 5000);
    }
  };

  const selectedDestinationsData = destinations.filter(d => selectedDestinations.includes(d.id));

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold brand-gradient-text mb-2 flex items-center gap-3">
                <PackageIcon size={32} />
                Package Builder
              </h1>
              <p className="text-gray-600">Create custom travel packages for your clients</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowBuilder(!showBuilder);
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition font-semibold flex items-center gap-2"
            >
              <Plus size={20} />
              {showBuilder ? 'Cancel' : 'New Package'}
            </button>
          </div>
        </div>

        {showBuilder && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingPackage ? 'Edit Package' : 'Create New Package'}
            </h2>

            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Package Name *</label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="e.g., European Adventure Package"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={packageDescription}
                  onChange={(e) => setPackageDescription(e.target.value)}
                  placeholder="Describe the package..."
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                />
              </div>

              {/* Destinations Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Destinations *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {destinations.slice(0, 20).map((dest) => (
                    <div
                      key={dest.id}
                      onClick={() => {
                        if (selectedDestinations.includes(dest.id)) {
                          removeDestination(dest.id);
                        } else {
                          addDestination(dest.id);
                        }
                      }}
                      className={`p-4 border rounded-lg cursor-pointer transition ${
                        selectedDestinations.includes(dest.id)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{dest.name}</h4>
                          <p className="text-sm text-gray-600">{dest.city}, {dest.country}</p>
                          {dest.priceMin && (
                            <p className="text-sm text-purple-600 font-semibold mt-1">
                              From ${dest.priceMin}
                            </p>
                          )}
                        </div>
                        {selectedDestinations.includes(dest.id) && (
                          <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center">
                            <X size={14} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedDestinations.length > 0 && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Selected Destinations ({selectedDestinations.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDestinationsData.map((dest) => (
                        <span
                          key={dest.id}
                          className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm flex items-center gap-2"
                        >
                          {dest.name}
                          <button
                            onClick={() => removeDestination(dest.id)}
                            className="hover:bg-purple-700 rounded-full p-0.5"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dates and Guests */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Users size={16} />
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    value={numberOfGuests}
                    onChange={(e) => setNumberOfGuests(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Activities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activities & Experiences</label>
                <div className="space-y-3 mb-3">
                  {activities.map((activity) => (
                    <div key={activity.id} className="p-4 border rounded-lg flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                        {activity.description && (
                          <p className="text-sm text-gray-600">{activity.description}</p>
                        )}
                        {activity.cost > 0 && (
                          <p className="text-sm text-green-600 font-semibold">${activity.cost.toFixed(2)}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeActivity(activity.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newActivity.title}
                    onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                    placeholder="Activity name"
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    placeholder="Description"
                    className="px-3 py-2 border rounded-lg"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newActivity.cost}
                      onChange={(e) => setNewActivity({ ...newActivity, cost: parseFloat(e.target.value) || 0 })}
                      placeholder="Cost"
                      className="flex-1 px-3 py-2 border rounded-lg"
                      min="0"
                      step="0.01"
                    />
                    <button
                      onClick={addActivity}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign size={24} />
                    Package Price
                  </h3>
                  <div className="text-3xl font-bold text-green-600">
                    ${calculatedPrice.toFixed(2)}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Destinations:</span>
                    <span className="font-semibold ml-2">{selectedDestinations.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Days:</span>
                    <span className="font-semibold ml-2">
                      {startDate && endDate
                        ? Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)))
                        : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-semibold ml-2">{numberOfGuests}</span>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-4">
                <button
                  onClick={savePackage}
                  disabled={saving || !packageName.trim() || selectedDestinations.length === 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {editingPackage ? 'Update Package' : 'Save Package'}
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    setShowBuilder(false);
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Packages List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Packages</h2>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="mx-auto animate-spin text-purple-600" size={48} />
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12">
              <PackageIcon className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No packages yet. Create your first package!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className="border rounded-lg p-6 hover:shadow-lg transition">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      pkg.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                      pkg.status === 'SENT' ? 'bg-blue-100 text-blue-700' :
                      pkg.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {pkg.status}
                    </span>
                  </div>
                  {pkg.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{pkg.description}</p>
                  )}
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={14} />
                      <span>{pkg.destinations?.length || 0} destinations</span>
                    </div>
                    {pkg.startDate && pkg.endDate && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} />
                        <span>
                          {new Date(pkg.startDate).toLocaleDateString()} - {new Date(pkg.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users size={14} />
                      <span>{pkg.numberOfGuests} guests</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                      <DollarSign size={14} />
                      <span>${parseFloat(pkg.totalPrice).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editPackage(pkg)}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deletePackage(pkg.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default PackageBuilder;


