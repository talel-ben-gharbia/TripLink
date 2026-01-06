import { Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { startTokenRefresh, stopTokenRefresh } from "./authRefresh";
import "./App.css";
import ErrorBoundary from "./Component/ErrorBoundary";
import Home from "./Pages/Home";
import EmailVerification from "./Pages/EmailVerification";
import ResetPasswordForm from "./Component/ResetPasswordForm";
import TravelerProfile from "./Pages/TravelerProfile";
import Settings from "./Pages/Settings";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import UserDetails from "./Pages/Admin/UserDetails";
import './index.css'
import Destinations from "./Pages/Destinations";
import DestinationDetails from "./Pages/DestinationDetails";
import AdminDestinations from "./Pages/Admin/AdminDestinations";
import Collections from "./Pages/Collections";
import CollectionDetail from "./Pages/CollectionDetail";
import PublicProfile from "./Pages/PublicProfile";
import Wishlist from "./Pages/Wishlist";

function App() {
  useEffect(() => {
    startTokenRefresh();
    return () => stopTokenRefresh();
  }, []);

  return (
    <ErrorBoundary>
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <Routes>
        <Route path="/" element={<Home />} />
      <Route path="/email-verification" element={<EmailVerification />} />
      <Route path="/reset-password" element={<ResetPasswordForm />} />
      <Route path="/profile" element={<TravelerProfile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/destinations" element={<Destinations />} />
      <Route path="/destinations/:id" element={<DestinationDetails />} />
      <Route path="/collections" element={<Collections />} />
      <Route path="/collections/:slug" element={<CollectionDetail />} />
      <Route path="/users/:id/profile" element={<PublicProfile />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users/:id" element={<UserDetails />} />
      <Route path="/admin/destinations" element={<AdminDestinations />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
