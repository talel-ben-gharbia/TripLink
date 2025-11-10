import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
      const res = await fetch("http://127.0.0.1:8000/api/resend-verification", {
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
    <div className="min-h-screen page-bg flex items-center justify-center">
      <div className="max-w-md w-full glass-card p-6">
        {status === "success" ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Email Verified!
            </h2>
            <p className="text-gray-600 mb-4">
              Your email has been successfully verified. You will be redirected
              to the login page shortly.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-4">
              {message || "The verification link is invalid or has expired."}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleResend}
                disabled={resending}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {resending ? "Sending..." : "Resend Verification Email"}
              </button>
              {resendMessage && (
                <p className="text-sm text-green-600">{resendMessage}</p>
              )}
              <button
                onClick={() => navigate("/")}
                className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Go to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailVerification;

