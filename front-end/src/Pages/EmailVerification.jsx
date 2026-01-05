import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Mail, ArrowLeft } from "lucide-react";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import { API_URL } from "../config";

function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get("status");
  const message = searchParams.get("message");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (status === "success") {
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
  }, [status, navigate]);

  const handleResend = async () => {
    const email =
      searchParams.get("email") || localStorage.getItem("pendingEmail");
    if (!email) {
      alert("Email not found. Please register again.");
      return;
    }

    setResending(true);
    setResendMessage("");

    try {
      const res = await fetch(`${API_URL}/api/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setResendMessage(
          data.message || "Verification email sent successfully!"
        );
        alert(data.message || "Verification email sent successfully!");
      } else {
        alert(data.error || "Failed to resend verification email");
      }
    } catch (err) {
      console.error("Resend error:", err);
      const errorMsg =
        err.message ||
        `Cannot connect to server. Please make sure the backend is running on ${API_URL}`;
      alert(errorMsg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen page-bg flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-card p-8">
          {status === "success" ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold brand-gradient-text mb-3">
                Email Verified!
              </h2>
              <p className="text-gray-600 mb-6">
                Your email has been successfully verified. You will be redirected
                to the login page shortly.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Loader2 className="animate-spin" size={16} />
                <span>Redirecting...</span>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-6">
                {message || "The verification link is invalid or has expired."}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-3 rounded-lg hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-md font-medium flex items-center justify-center gap-2"
                >
                  {resending ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Mail size={18} />
                      <span>Resend Verification Email</span>
                    </>
                  )}
                </button>
                {resendMessage && (
                  <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{resendMessage}</p>
                )}
                <button
                  onClick={() => navigate("/")}
                  className="w-full bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all shadow-md font-medium flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={18} />
                  <span>Go to Home</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default EmailVerification;

