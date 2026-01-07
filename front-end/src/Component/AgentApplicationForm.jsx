import React, { useState } from 'react';
import { Briefcase, Building, Award, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { submitAgentApplication } from '../services/agentService';

const AgentApplicationForm = ({ onSuccess, onCancel, initialData = {} }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: initialData.email || '',
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    phone: initialData.phone || '',
    companyName: initialData.companyName || '',
    licenseNumber: initialData.licenseNumber || '',
    yearsExperience: initialData.yearsExperience || '',
    specializations: initialData.specializations || [],
    motivation: initialData.motivation || '',
  });

  const specializationOptions = [
    'Luxury Travel',
    'Adventure Travel',
    'Business Travel',
    'Family Travel',
    'Honeymoon & Romance',
    'Group Travel',
    'Cruise Travel',
    'Destination Weddings',
    'Corporate Events',
    'Solo Travel',
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleSpecialization = (spec) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Validate years of experience if provided
    if (formData.yearsExperience && (isNaN(formData.yearsExperience) || formData.yearsExperience < 0 || formData.yearsExperience > 50)) {
      setError('Years of experience must be a number between 0 and 50');
      setLoading(false);
      return;
    }

    try {
      const response = await submitAgentApplication({
        email: formData.email.trim().toLowerCase(),
        firstName: formData.firstName?.trim() || null,
        lastName: formData.lastName?.trim() || null,
        phone: formData.phone?.trim() || null,
        companyName: formData.companyName?.trim() || null,
        licenseNumber: formData.licenseNumber?.trim() || null,
        yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience, 10) : null,
        specializations: formData.specializations && formData.specializations.length > 0 ? formData.specializations : null,
        motivation: formData.motivation?.trim() || null,
      });

      if (response && response.message) {
        setSuccess(true);
        if (onSuccess) {
          setTimeout(() => onSuccess(), 2000);
        }
      } else {
        setError('Unexpected response from server');
        setLoading(false);
      }
    } catch (err) {
      console.error('Agent application error:', err);
      let errorMessage = 'Failed to submit application. Please try again.';
      
      if (err.response) {
        // Server responded with error
        if (err.response.data) {
          if (err.response.data.error) {
            errorMessage = err.response.data.error;
          } else if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
            errorMessage = err.response.data.errors.join(', ');
          } else if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          }
        } else if (err.response.status === 400) {
          errorMessage = 'Invalid data. Please check your input and try again.';
        } else if (err.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else {
        // Something else happened
        errorMessage = err.message || 'An unexpected error occurred';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
        <p className="text-gray-600 mb-4">
          Your agent application has been submitted successfully. An administrator will review it and contact you via email at <strong>{formData.email}</strong>.
        </p>
        <p className="text-sm text-gray-500 mb-4">
          If approved, you will receive an email with your login credentials and instructions to set up your agent account.
        </p>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="your.email@example.com"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="First name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Last name"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Phone number"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Building className="inline mr-2" size={16} />
          Company Name (Optional)
        </label>
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Your travel agency name"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Award className="inline mr-2" size={16} />
          License Number (Optional)
        </label>
        <input
          type="text"
          name="licenseNumber"
          value={formData.licenseNumber}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Travel agent license number"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Briefcase className="inline mr-2" size={16} />
          Years of Experience
        </label>
        <input
          type="number"
          name="yearsExperience"
          value={formData.yearsExperience}
          onChange={handleInputChange}
          min="0"
          max="50"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Number of years"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Specializations (Select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {specializationOptions.map((spec) => (
            <button
              key={spec}
              type="button"
              onClick={() => toggleSpecialization(spec)}
              className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                formData.specializations.includes(spec)
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white border-gray-300 hover:border-purple-300'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <FileText className="inline mr-2" size={16} />
          Why do you want to become an agent? (Optional)
        </label>
        <textarea
          name="motivation"
          value={formData.motivation}
          onChange={handleInputChange}
          rows="4"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Tell us about your experience and why you'd like to join as a travel agent..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !formData.email}
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Application'
          )}
        </button>
      </div>
    </form>
  );
};

export default AgentApplicationForm;

