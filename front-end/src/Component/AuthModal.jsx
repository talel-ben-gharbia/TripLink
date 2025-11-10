import React, { useEffect, useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { X } from "lucide-react";
import { API_URL } from "../config";

function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState("login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [step, setStep] = useState(1);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    profileImage: null,
    profilePreview: null,
    travelStyles: [],
    interests: [],
  });

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include', // allow Set-Cookie for refresh/session
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!res.ok) {
        // Try to parse error message
        let errorMessage = "Login failed. Please check your credentials.";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use default message
        }
        alert(errorMessage);
        return;
      }

      const data = await res.json();

      if (!data.token) {
        alert("Invalid response from server. Please try again.");
        return;
      }

      // Store token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Close modal and redirect based on user role
      onClose();
      if (data.user.isAdmin) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMsg =
        err.message ||
        `Cannot connect to server. Please make sure the backend is running on ${API_URL}`;
      alert(errorMsg);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validate password match and complexity on step 1
    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      if (formData.password.length < 8) {
        alert("Password must be at least 8 characters!");
        return;
      }
      // Check password complexity
      const hasLower = /(?=.*[a-z])/.test(formData.password);
      const hasUpper = /(?=.*[A-Z])/.test(formData.password);
      const hasNumber = /(?=.*\d)/.test(formData.password);
      if (!hasLower || !hasUpper || !hasNumber) {
        alert(
          "Password must contain at least one uppercase letter, one lowercase letter, and one number!"
        );
        return;
      }
      return setStep(step + 1);
    }

    if (step < 3) {
      return setStep(step + 1);
    }

    const formDataToSend = new FormData();
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("firstName", formData.firstName);
    formDataToSend.append("lastName", formData.lastName);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append(
      "travelStyles",
      JSON.stringify(formData.travelStyles)
    );
    formDataToSend.append("interests", JSON.stringify(formData.interests));

    if (formData.profileImage) {
      formDataToSend.append("profileImage", formData.profileImage);
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        body: formDataToSend,
        // Don't set Content-Type for FormData - browser sets it automatically with boundary
      });

      // Check if response is successful first
      if (res.ok && (res.status === 201 || res.status === 200)) {
        // Try to parse JSON, but if it fails, still show success
        try {
          await res.json(); // Response is OK, parse to clear buffer
          // Store email for resend functionality
          localStorage.setItem("pendingEmail", formData.email);
          // Success - show email verification screen
          setEmailVerificationSent(true);
          return;
        } catch (e) {
          // If JSON parsing fails but status is OK, still success
          localStorage.setItem("pendingEmail", formData.email);
          setEmailVerificationSent(true);
          return;
        }
      }

      // Handle errors - only parse if not OK
      try {
        const data = await res.json();
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessage = data.errors.join(", ");
          alert(errorMessage);
        } else {
          alert(data.message || data.error || "Registration failed");
        }
      } catch (e) {
        alert("Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      const errorMsg =
        err.message ||
        `Cannot connect to server. Please make sure the backend is running on ${API_URL}`;
      alert(errorMsg);
    }
  };
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profileImage: file,
          profilePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSelection = (category, value) => {
    setFormData((prev) => {
      const current = prev[category];
      return {
        ...prev,
        [category]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };
  const handleInput = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const travelStyles = [
    "Adventure",
    "Luxury",
    "Budget",
    "Cultural",
    "Beach",
    "Mountains",
  ];
  const interests = [
    "Photography",
    "Food",
    "Shopping",
    "Nature",
    "History",
    "Nightlife",
  ];

  const heroImages =
    mode === "login"
      ? [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800",
      ]
      : [
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
      ];
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-slide-up">
        <div className="bg-white rounded-lg shadow-lg flex w-full max-w-4xl relative overflow-hidden">
          <div className="hidden md:block w-1/2 relative overflow-hidden">
            {heroImages.map((img, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentImage ? "opacity-100" : "opacity-0"
                  }`}
                style={{
                  backgroundImage: `url(${img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            ))}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center p-12">
              <div className="text-white text-center">
                <h1 className="text-5xl font-bold mb-4">
                  {mode === "login" ? "Welcome Back" : "Begin Your Journey"}
                </h1>
                <p className="text-xl mb-6">
                  {mode === "login"
                    ? "Your amazing journey continues"
                    : "Join the AI travel revolution"}
                </p>
                <div className="flex items-center justify-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="icon-check-circle text-green-400"></div>
                    <span>Smart Recommendations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="icon-zap text-yellow-400"></div>
                    <span>Instant Booking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-1/2 p-6 flex flex-col justify-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100"
            >
              <X className="text-gray300" />
            </button>

            {showForgotPassword ? (
              <ForgotPasswordForm
                onBack={() => setShowForgotPassword(false)}
                onSuccess={() => {
                  setShowForgotPassword(false);
                  setMode("login");
                }}
              />
            ) : mode === "login" ? (
              <LoginForm
                switchMode={() => setMode("register")}
                formData={formData}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                handleLogin={handleLogin}
                handleInput={handleInput}
                onForgotPassword={() => setShowForgotPassword(true)}
              />
            ) : emailVerificationSent ? (
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-800">
                  Check Your Email!
                </h2>
                <p className="text-gray-600 mb-2">
                  We've sent a verification link to
                </p>
                <p className="font-semibold text-primary mb-4">
                  {formData.email}
                </p>
                <p className="text-sm text-gray-600 mb-6">
                  Please check your inbox and click the link to activate your
                  account.
                </p>
                <div className="space-y-3 w-full">
                  <button
                    className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
                    onClick={async () => {
                      try {
                        const res = await fetch(
                          "http://127.0.0.1:8000/api/resend-verification",
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ email: formData.email }),
                          }
                        );
                        const data = await res.json();
                        if (res.ok) {
                          alert(
                            data.message ||
                            "Verification email sent successfully!"
                          );
                        } else {
                          alert(data.error || "Failed to resend email");
                        }
                      } catch (err) {
                        alert("Network error. Please try again later.");
                      }
                    }}
                  >
                    Resend Verification Email
                  </button>
                  <button
                    className="w-full px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    onClick={() => {
                      setMode("login");
                      setEmailVerificationSent(false);
                      setStep(1);
                      setFormData({
                        email: "",
                        password: "",
                        confirmPassword: "",
                        firstName: "",
                        lastName: "",
                        phone: "",
                        profileImage: null,
                        profilePreview: null,
                        travelStyles: [],
                        interests: [],
                      });
                    }}
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            ) : (
              <RegisterForm
                switchMode={() => setMode("login")}
                step={step}
                formData={formData}
                handleImageUpload={handleImageUpload}
                toggleSelection={toggleSelection}
                handleSignup={handleSignup}
                travelStyles={travelStyles}
                interests={interests}
                handleInput={handleInput}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AuthModal;