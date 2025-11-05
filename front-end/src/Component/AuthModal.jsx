import React, { useEffect, useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { X } from "lucide-react";

function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState("login");
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

  const handleLogin = (e) => {
    e.preventDefault();
    window.location.href = "/";
  };

  const handleSignup = async (e) => {
    e.preventDefault();
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
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      setEmailVerificationSent(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-slide-up">
      <div className="bg-white rounded-lg shadow-lg flex w-full max-w-4xl  relative overflow-hidden">
        <div className="hidden md:block w-1/2 relative overflow-hidden">
          {heroImages.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                idx === currentImage ? "opacity-100" : "opacity-0"
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

          {mode === "login" ? (
            <LoginForm
              switchMode={() => setMode("register")}
              formData={formData}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleLogin={handleLogin}
            />
          ) : emailVerificationSent ? (
            <div className="flex flex-col items-center justify-center text-center p-6">
              <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
              <p className="mb-4">
                A verification link has been sent to{" "}
                <strong>{formData.email}</strong>. Please check your inbox and
                click the link to activate your account.
              </p>
              <button
                className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-600"
                onClick={() => setMode("login")}
              >
                Go to Login
              </button>
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
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
