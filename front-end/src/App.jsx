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
import Destinations from "./Pages/Destinations";
import DestinationDetails from "./Pages/DestinationDetails";
import AdminDestinations from "./Pages/Admin/AdminDestinations";
import Chatbot from "./ChatBot/ChatBot";
import ReservationSuccess from "./Pages/ReservationSuccess";
import ReservationCancelled from "./Pages/ReservationCancelled";

function App() {
  useEffect(() => {
    startTokenRefresh();
    return () => stopTokenRefresh();
  }, []);

  return (
    <div>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/email-verification" element={<EmailVerification />} />
      <Route path="/reset-password" element={<ResetPasswordForm />} />
      <Route path="/profile" element={<TravelerProfile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/destinations" element={<Destinations />} />
      <Route path="/destinations/:id" element={<DestinationDetails />} />
      <Route path="/reservation-success" element={<ReservationSuccess />} />
      <Route path="/reservation-cancelled" element={<ReservationCancelled />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users/:id" element={<UserDetails />} />
      <Route path="/admin/destinations" element={<AdminDestinations />} />
    </Routes>
    <Chatbot />
    </div>
  );
}

export default App;
