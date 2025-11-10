import { Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { startTokenRefresh, stopTokenRefresh } from "./authRefresh";
import "./App.css";
import Home from "./Pages/Home";
import EmailVerification from "./Pages/EmailVerification";
import ResetPasswordForm from "./Component/ResetPasswordForm";
import TravelerProfile from "./Pages/TravelerProfile";
import Settings from "./Pages/Settings";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import UserDetails from "./Pages/Admin/UserDetails";
import './index.css'

function App() {
  useEffect(() => {
    startTokenRefresh();
    return () => stopTokenRefresh();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/email-verification" element={<EmailVerification />} />
      <Route path="/reset-password" element={<ResetPasswordForm />} />
      <Route path="/profile" element={<TravelerProfile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users/:id" element={<UserDetails />} />
    </Routes>
  );
}

export default App;
