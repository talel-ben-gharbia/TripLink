import { Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { startTokenRefresh, stopTokenRefresh } from "./authRefresh";
import "./App.css";
import ErrorBoundary from "./Component/ErrorBoundary";
import PageTracker from "./Component/PageTracker";
import { setupSkipLink, enhanceAccessibility } from "./utils/accessibility";
import Home from "./Pages/Home";
import EmailVerification from "./Pages/EmailVerification";
import ResetPasswordForm from "./Component/ResetPasswordForm";
import TravelerProfile from "./Pages/TravelerProfile";
import Settings from "./Pages/Settings";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import UserDetails from "./Pages/Admin/UserDetails";
import "./index.css";
import Destinations from "./Pages/Destinations";
import DestinationDetails from "./Pages/DestinationDetails";
import AdminDestinations from "./Pages/Admin/AdminDestinations";
import Collections from "./Pages/Collections";
import CollectionDetail from "./Pages/CollectionDetail";
import PublicProfile from "./Pages/PublicProfile";
import Wishlist from "./Pages/Wishlist";
import MyBookings from "./Pages/MyBookings";
import AgentDashboard from "./Pages/AgentDashboard";
import ApplyAsAgent from "./Pages/ApplyAsAgent";
import ChangePassword from "./Pages/ChangePassword";
import BookingSuccess from "./Pages/BookingSuccess";
import BookingCancel from "./Pages/BookingCancel";
import HelpCenter from "./Pages/HelpCenter";
import CompareDestinations from "./Pages/CompareDestinations";
import ClientPortfolio from "./Pages/Agent/ClientPortfolio";
import PackageBuilder from "./Pages/Agent/PackageBuilder";
import CommissionDashboard from "./Pages/Agent/CommissionDashboard";
import ChatBot from "./ChatBot/ChatBot";

function App() {
  useEffect(() => {
    startTokenRefresh();
    setupSkipLink();
    enhanceAccessibility();
    return () => stopTokenRefresh();
  }, []);

  return (
    <ErrorBoundary>
      <PageTracker />
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/profile" element={<TravelerProfile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/destinations/:id" element={<DestinationDetails />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collections/:slug" element={<CollectionDetail />} />
        <Route path="/users/:id/profile" element={<PublicProfile />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/booking-success" element={<BookingSuccess />} />
        <Route path="/booking-cancel" element={<BookingCancel />} />
        <Route path="/agent/dashboard" element={<AgentDashboard />} />
        <Route path="/agent/apply" element={<ApplyAsAgent />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users/:id" element={<UserDetails />} />
        <Route path="/admin/destinations" element={<AdminDestinations />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/compare" element={<CompareDestinations />} />
        <Route path="/agent/clients" element={<ClientPortfolio />} />
        <Route path="/agent/packages" element={<PackageBuilder />} />
        <Route path="/agent/commissions" element={<CommissionDashboard />} />
      </Routes>
      <ChatBot />
    </ErrorBoundary>
  );
}

export default App;
