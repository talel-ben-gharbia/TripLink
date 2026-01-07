import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import Navbar from '../Component/Navbar';
import Footer from '../Component/Footer';
import SEO from '../Component/SEO';
import api from '../api';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    // Check if user is authenticated and must change password
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token || !userData) {
      navigate('/');
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (!user.mustChangePassword) {
        // User doesn't need to change password, redirect to appropriate dashboard
        if (user.isAdmin) {
          navigate('/admin');
        } else if (user.isAgent) {
          navigate('/agent-dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (e) {
      navigate('/');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      await api.post('/api/account/force-change-password', {
        newPassword: formData.newPassword
      });

      setSuccess(true);
      
      // Update user data to remove mustChangePassword flag
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        user.mustChangePassword = false;
        localStorage.setItem('user', JSON.stringify(user));
      }

      // Redirect after 2 seconds
      setTimeout(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.isAdmin) {
          navigate('/admin');
        } else if (user.isAgent) {
          navigate('/agent-dashboard');
        } else {
          navigate('/');
        }
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
        <SEO title="Password Changed - TripLink" />
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Changed Successfully!</h2>
          <p className="text-gray-600 mb-4">Your password has been updated. Redirecting...</p>
        </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <SEO 
        title="Change Password - TripLink"
        description="Change your TripLink account password. Create a strong, secure password to protect your account."
      />
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <Lock className="mx-auto text-purple-600 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Change Your Password</h2>
          <p className="text-gray-600 text-sm">
            You must change your password before continuing. Please choose a strong password.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.newPassword && (
              <div className="mt-2 text-xs space-y-1">
                <p className={formData.newPassword.length >= 8 ? 'text-green-600' : 'text-red-500'}>
                  {formData.newPassword.length >= 8 ? '✓' : '✗'} At least 8 characters
                </p>
                <p className={/(?=.*[a-z])/.test(formData.newPassword) ? 'text-green-600' : 'text-red-500'}>
                  {/(?=.*[a-z])/.test(formData.newPassword) ? '✓' : '✗'} Lowercase letter
                </p>
                <p className={/(?=.*[A-Z])/.test(formData.newPassword) ? 'text-green-600' : 'text-red-500'}>
                  {/(?=.*[A-Z])/.test(formData.newPassword) ? '✓' : '✗'} Uppercase letter
                </p>
                <p className={/(?=.*\d)/.test(formData.newPassword) ? 'text-green-600' : 'text-red-500'}>
                  {/(?=.*\d)/.test(formData.newPassword) ? '✓' : '✗'} Number
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Changing Password...
              </>
            ) : (
              'Change Password'
            )}
          </button>
        </form>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default ChangePassword;


