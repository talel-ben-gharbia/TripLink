import React, { useState } from "react";
import { Mail } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { API_URL } from "../config";

export default function ForgotPasswordForm({ onBack, onSuccess }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(
          data.message ||
          "If the email exists, a password reset link has been sent."
        );
        if (onSuccess) onSuccess();
      } else {
        setMessage(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.message ||
        `Cannot connect to server. Please make sure the backend is running on ${API_URL}`;
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={onBack}
        className="mb-4 flex items-center text-gray-600 hover:text-primary transition-colors"
      >
        <ArrowLeft className="mr-2" size={16} />
        Back to Login
      </button>

      <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
      <p className="text-gray-600 mb-6 text-center text-sm">
        Enter your email address and we'll send you a link to reset your
        password.
      </p>

      {message && (
        <div
          className={`mb-4 p-3 rounded-md text-sm ${message.includes("sent") || message.includes("success")
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
            }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-4 text-gray300" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-300 bg-white shadow-sm"
            placeholder="you@example.com"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl px-5 py-3 hover:opacity-90 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </>
  );
}
