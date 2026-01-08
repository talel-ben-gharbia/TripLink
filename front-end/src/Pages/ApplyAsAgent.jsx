import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Component/Navbar';
import Footer from '../Component/Footer';
import AuthModal from '../Component/AuthModal';
import AgentApplicationForm from '../Component/AgentApplicationForm';
import SEO from '../Component/SEO';
import { getAgentApplicationStatus } from '../services/agentService';
import { Briefcase, CheckCircle, Clock, X } from 'lucide-react';

const ApplyAsAgent = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [loading, setLoading] = useState(true);

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
      setUser(parsedUser);
      
      if (parsedUser.isAgent) {
        // Already an agent, redirect to dashboard
        navigate('/agent/dashboard');
        return;
      }

      loadApplicationStatus();
    } catch (e) {
      setIsOpen(true);
    }
  }, [navigate]);

  const loadApplicationStatus = async () => {
    setLoading(true);
    try {
      const data = await getAgentApplicationStatus();
      setApplicationStatus(data);
    } catch (error) {
      // Error loading application status - error logged for debugging
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSuccess = () => {
    loadApplicationStatus();
  };

  if (!user) {
    return (
      <div className="min-h-screen page-bg">
        <Navbar openAuth={() => setIsOpen(true)} />
        <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg flex flex-col">
      <SEO 
        title="Apply as Travel Agent - TripLink"
        description="Join TripLink as a travel agent. Help travelers plan amazing trips and earn commissions. Apply now to become a certified travel agent."
      />
      <Navbar openAuth={() => setIsOpen(true)} />
      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <div className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8 text-center">
          <Briefcase className="mx-auto text-purple-600 mb-4" size={64} />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Travel Agent</h1>
          <p className="text-gray-600">
            Join our network of professional travel agents and help travelers plan their perfect trips
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : applicationStatus?.hasApplication ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="text-center">
              {applicationStatus.application.status === 'PENDING' && (
                <>
                  <Clock className="mx-auto text-yellow-600 mb-4" size={64} />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Pending</h2>
                  <p className="text-gray-600 mb-4">
                    Your application is currently under review. We'll notify you once a decision has been made.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                    <p className="text-sm text-yellow-800">
                      <strong>Applied on:</strong> {new Date(applicationStatus.application.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </>
              )}
              {applicationStatus.application.status === 'APPROVED' && (
                <>
                  <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Approved!</h2>
                  <p className="text-gray-600 mb-4">
                    Congratulations! Your application has been approved. You now have access to the agent dashboard.
                  </p>
                  <button
                    onClick={() => navigate('/agent/dashboard')}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Go to Agent Dashboard
                  </button>
                </>
              )}
              {applicationStatus.application.status === 'REJECTED' && (
                <>
                  <X className="mx-auto text-red-600 mb-4" size={64} />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Rejected</h2>
                  <p className="text-gray-600 mb-4">
                    Unfortunately, your application was not approved at this time.
                  </p>
                  {applicationStatus.application.adminNotes && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left mb-4">
                      <p className="text-sm text-red-800">
                        <strong>Notes:</strong> {applicationStatus.application.adminNotes}
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    You can contact support if you have questions about this decision.
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <AgentApplicationForm
              onSuccess={handleApplicationSuccess}
              onCancel={() => navigate('/')}
            />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ApplyAsAgent;


