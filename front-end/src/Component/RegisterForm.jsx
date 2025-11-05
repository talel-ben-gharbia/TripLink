import { useState } from "react";
import { Mail } from "lucide-react";
import { Lock } from "lucide-react";
import { Eye } from "lucide-react";
import { EyeOff } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Camera } from "lucide-react";
import { Plus } from "lucide-react";
import { User } from "lucide-react";
import { Phone } from "lucide-react";
export default function RegisterForm({ formData,switchMode ,step,handleSignup,showPassword,setShowPassword,handleImageUpload,travelStyles,toggleSelection,interests}) {
  
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
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                s <= step ? "bg-primary text-white" : "bg-gray300 text-gray600"
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
                className="w-full pl-12 pr-4 py-3 border-2 border-gray300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-300 bg-white shadow-sm"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray300" />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-300 bg-white shadow-sm"
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
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray300" />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-300 bg-white shadow-sm"
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
                  type="text"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-300 bg-white shadow-sm"
                  placeholder="First name"
                  required
                />
              </div>
              <div className="relative">
                <User className="absolute left-4 top-4 text-gray300" />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-300 bg-white shadow-sm"
                  placeholder="Last name"
                  required
                />
              </div>
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-4 text-gray300" />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-300 bg-white shadow-sm"
                placeholder="Phone number"
                required
              />
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
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all transform hover:scale-105 shadow-sm ${
                      formData.travelStyles.includes(style)
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
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all transform hover:scale-105 shadow-sm ${
                      formData.interests.includes(interest)
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
          className=" flex items-center  justify-center bg-primary rounded-md text-white px-5 py-3 hover:scale-[1.02] transition-all shadow-md  gap-1 hover:gap-3"
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
