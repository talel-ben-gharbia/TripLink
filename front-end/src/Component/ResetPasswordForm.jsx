import React, { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { Eye } from "lucide-react";
import { EyeOff } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { API_URL } from "../config";

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage("Invalid reset link. Please request a new one.");
    }
  }, [token]);

  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setMessage(passwordErrors.join(". "));
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
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

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Invalid Reset Link
        </h2>
        <p className="text-gray-600 mb-4">
          Please request a new password reset link.
        </p>
        <a href="/" className="text-primary hover:underline">
          Go to Login
        </a>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-green-600">
          Success!
        </h2>
        <p className="text-gray-600 mb-4 text-center">{message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
      <p className="text-gray-600 mb-6 text-center text-sm">
        Enter your new password below.
      </p>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg text-xs text-gray-700">
        <p className="font-semibold mb-1">Password Requirements:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>At least 8 characters</li>
          <li>At least one lowercase letter (a-z)</li>
          <li>At least one uppercase letter (A-Z)</li>
          <li>At least one number (0-9)</li>
        </ul>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-md text-sm ${
            message.includes("success")
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div className="relative">
          <Lock className="absolute left-4 top-4 text-gray300" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-300 bg-white shadow-sm"
            placeholder="New password"
            required
            minLength={8}
          />
          <div
            className="absolute right-4 top-4 hover:scale-110 transition-transform cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <Eye className="text-gray300" />
            ) : (
              <EyeOff className="text-gray300" />
            )}
          </div>
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-4 text-gray300" />
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-300 bg-white shadow-sm"
            placeholder="Confirm password"
            required
            minLength={8}
          />
          <div
            className="absolute right-4 top-4 hover:scale-110 transition-transform cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <Eye className="text-gray300" />
            ) : (
              <EyeOff className="text-gray300" />
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl px-5 py-3 hover:opacity-90 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
