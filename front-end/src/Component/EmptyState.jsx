import React from 'react';
import { Package, Inbox, Calendar, Users, Briefcase, Search, FileText, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({ 
  icon: Icon = Inbox, 
  title, 
  message, 
  actionLabel, 
  actionUrl,
  actionOnClick,
  secondaryActionLabel,
  secondaryActionOnClick
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
        <Icon className="text-purple-600" size={48} />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-md mb-6">{message}</p>
      <div className="flex gap-4">
        {actionUrl && (
          <Link
            to={actionUrl}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition font-semibold shadow-lg hover:shadow-xl"
          >
            {actionLabel}
          </Link>
        )}
        {actionOnClick && (
          <button
            onClick={actionOnClick}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition font-semibold shadow-lg hover:shadow-xl"
          >
            {actionLabel}
          </button>
        )}
        {secondaryActionLabel && secondaryActionOnClick && (
          <button
            onClick={secondaryActionOnClick}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

// Pre-configured empty states
export const EmptyBookings = ({ onCreateBooking }) => (
  <EmptyState
    icon={Calendar}
    title="No Bookings Yet"
    message="Start planning your next adventure! Browse destinations and create your first booking."
    actionLabel="Browse Destinations"
    actionUrl="/destinations"
    secondaryActionLabel="View Recommendations"
    secondaryActionUrl="/"
  />
);

export const EmptyDestinations = () => (
  <EmptyState
    icon={Search}
    title="No Destinations Found"
    message="Try adjusting your search filters or browse our featured destinations."
    actionLabel="View Featured"
    actionUrl="/destinations?featured=true"
  />
);

export const EmptyPackages = ({ onCreatePackage }) => (
  <EmptyState
    icon={Package}
    title="No Packages Yet"
    message="Create custom travel packages for your clients to help them plan their perfect trip."
    actionLabel="Create Package"
    actionOnClick={onCreatePackage}
  />
);

export const EmptyClients = () => (
  <EmptyState
    icon={Users}
    title="No Clients Yet"
    message="Your client portfolio will appear here once you start working on bookings."
    actionLabel="View Pending Bookings"
    actionUrl="/agent/dashboard"
  />
);

export const EmptyMessages = () => (
  <EmptyState
    icon={MessageSquare}
    title="No Messages"
    message="Start a conversation with your clients to provide personalized assistance."
    actionLabel="View Clients"
    actionUrl="/agent/clients"
  />
);

export const EmptyBookingsAgent = () => (
  <EmptyState
    icon={Briefcase}
    title="No Bookings Assigned"
    message="New bookings requiring agent assistance will appear here. Check back soon!"
    actionLabel="View Dashboard"
    actionUrl="/agent/dashboard"
  />
);

export default EmptyState;
