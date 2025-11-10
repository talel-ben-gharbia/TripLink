import { Mail } from "lucide-react";
import { Lock } from "lucide-react";
import { Eye } from "lucide-react";
import { EyeOff } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Camera } from "lucide-react";
import { Plus } from "lucide-react";
import { User } from "lucide-react";
import { Phone } from "lucide-react";
export default function RegisterForm({
  formData,
  switchMode,
  step,
  handleSignup,
  showPassword,
  setShowPassword,
  handleImageUpload,
  travelStyles,
  toggleSelection,
  interests,
  handleInput,
}) {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
      <p className="text-gray-600 mb-2">Join thousands of happy travelers</p>

      <div className="flex items-center justify-center space-x-4 mb-4 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <div className="icon-check text-green-600"></div>
          <span>Free forever</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="icon-shield text-blue-600"></div>
          <span>100% secure</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="icon-gift text-purple-600"></div>
          <span>20% off first booking</span>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${s <= step ? "bg-primary text-white" : "bg-gray300 text-gray600"
                }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`w-12 h-1 ${s < step ? "bg-primary" : "bg-gray300"}`}
              ></div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSignup} className="flex flex-col space-y-4">
        {step === 1 && (
          <div className="space-y-4 animate-slide-up">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Account Info
            </h3>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray300" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInput("email", e.target.value)}
                onBlur={(e) => {
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (e.target.value && !emailRegex.test(e.target.value)) {
                    e.target.setCustomValidity(
                      "Please enter a valid email address"
                    );
                  } else {
                    e.target.setCustomValidity("");
                  }
                }}
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-300 bg-white shadow-sm ${formData.email &&
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                    ? "border-red-300"
                    : "border-gray300"
                  }`}
                placeholder="you@example.com"
                required
              />
              {formData.email &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                  <p className="text-red-500 text-xs mt-1">
                    Please enter a valid email address
                  </p>
                )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray300" />
              <input
                value={formData.password}
                onChange={(e) => handleInput("password", e.target.value)}
                type={showPassword ? "text" : "password"}
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-300 bg-white shadow-sm ${formData.password &&
                    (formData.password.length < 8 ||
                      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
                    ? "border-red-300"
                    : "border-gray300"
                  }`}
                placeholder="password"
                required
              />
              <div
                className="absolute right-4 top-4 hover:scale-110 transition-transform"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye className="text-gray300" />
                ) : (
                  <EyeOff className="text-gray300" />
                )}
              </div>
              {formData.password && (
                <div className="mt-1 text-xs">
                  <p
                    className={
                      formData.password.length >= 8
                        ? "text-green-600"
                        : "text-red-500"
                    }
                  >
                    {formData.password.length >= 8 ? "✓" : "✗"} At least 8
                    characters
                  </p>
                  <p
                    className={
                      /(?=.*[a-z])/.test(formData.password)
                        ? "text-green-600"
                        : "text-red-500"
                    }
                  >
                    {/(?=.*[a-z])/.test(formData.password) ? "✓" : "✗"}{" "}
                    Lowercase letter
                  </p>
                  <p
                    className={
                      /(?=.*[A-Z])/.test(formData.password)
                        ? "text-green-600"
                        : "text-red-500"
                    }
                  >
                    {/(?=.*[A-Z])/.test(formData.password) ? "✓" : "✗"}{" "}
                    Uppercase letter
                  </p>
                  <p
                    className={
                      /(?=.*\d)/.test(formData.password)
                        ? "text-green-600"
                        : "text-red-500"
                    }
                  >
                    {/(?=.*\d)/.test(formData.password) ? "✓" : "✗"} Number
                  </p>
                </div>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray300" />
              <input
                value={formData.confirmPassword}
                onChange={(e) => handleInput("confirmPassword", e.target.value)}
                type={showPassword ? "text" : "password"}
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-300 bg-white shadow-sm ${formData.confirmPassword &&
                    formData.password !== formData.confirmPassword
                    ? "border-red-300"
                    : "border-gray300"
                  }`}
                placeholder="confirm password"
                required
              />
              <div
                className="absolute right-4 top-4 hover:scale-110 transition-transform"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye className="text-gray300" />
                ) : (
                  <EyeOff className="text-gray300" />
                )}
              </div>
              {formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    Passwords do not match
                  </p>
                )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-slide-up">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Personal Info and Profile
            </h3>
            <div className="flex justify-center mb-4">
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="profile-upload"
                />
                <label htmlFor="profile-upload" className="cursor-pointer">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden group-hover:scale-105 transition-transform">
                    {formData.profilePreview ? (
                      <img
                        src={formData.profilePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-7 h-7 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Plus />
                  </div>
                </label>
              </div>
            </div>
            <p className="text-center text-sm text-gray600 mb-4 font-medium">
              Upload your profile picture (optional)
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-4 top-4 text-gray300" />
                <input
                  value={formData.firstName}
                  onChange={(e) => handleInput("firstName", e.target.value)}
                  type="text"
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-300 bg-white shadow-sm ${formData.firstName && formData.firstName.length < 2
                      ? "border-red-300"
                      : "border-gray300"
                    }`}
                  placeholder="First name"
                  required
                  minLength={2}
                />
                {formData.firstName && formData.firstName.length < 2 && (
                  <p className="text-red-500 text-xs mt-1">
                    First name must be at least 2 characters
                  </p>
                )}
              </div>
              <div className="relative">
                <User className="absolute left-4 top-4 text-gray300" />
                <input
                  value={formData.lastName}
                  onChange={(e) => handleInput("lastName", e.target.value)}
                  type="text"
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-300 bg-white shadow-sm ${formData.lastName && formData.lastName.length < 2
                      ? "border-red-300"
                      : "border-gray300"
                    }`}
                  placeholder="Last name"
                  required
                  minLength={2}
                />
                {formData.lastName && formData.lastName.length < 2 && (
                  <p className="text-red-500 text-xs mt-1">
                    Last name must be at least 2 characters
                  </p>
                )}
              </div>
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-4 text-gray300" />
              <input
                value={formData.phone}
                onChange={(e) =>
                  handleInput("phone", e.target.value.replace(/\D/g, ""))
                }
                type="tel"
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-300 bg-white shadow-sm ${formData.phone &&
                    (formData.phone.length < 8 || formData.phone.length > 15)
                    ? "border-red-300"
                    : "border-gray300"
                  }`}
                placeholder="Phone number"
                required
                minLength={8}
                maxLength={15}
              />
              {formData.phone &&
                (formData.phone.length < 8 || formData.phone.length > 15) && (
                  <p className="text-red-500 text-xs mt-1">
                    Phone number must be 8-15 digits
                  </p>
                )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-slide-up">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Travel Preferences
            </h3>
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">
                Travel Styles (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {travelStyles.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => toggleSelection("travelStyles", style)}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all transform hover:scale-105 shadow-sm ${formData.travelStyles.includes(style)
                        ? "bg-primary text-white border-primary shadow-lg"
                        : "bg-white border-gray300 hover:border-primary"
                      }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">
                Interests (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleSelection("interests", interest)}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all transform hover:scale-105 shadow-sm ${formData.interests.includes(interest)
                        ? "bg-primary text-white border-purple-600 shadow-lg"
                        : "bg-white border-gray300 hover:border-primary"
                      }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl px-6 py-3 hover:opacity-90 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] gap-1 hover:gap-3"
        >
          <span>{step === 3 ? "Complete Registration" : "Continue"}</span>
          <ArrowRight className="text-base pt-1" />
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4 text-center">
        Already have an account?
        <button
          onClick={switchMode}
          className="text-primary  ml-1 font-semibold hover:underline"
        >
          Sign In
        </button>
      </p>
    </>
  );
}
