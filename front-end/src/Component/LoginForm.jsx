import { ShieldCheck } from "lucide-react";
import { Zap } from "lucide-react";
import { Mail } from "lucide-react";
import { Lock } from "lucide-react";
import { Eye } from "lucide-react";
import { EyeOff } from "lucide-react";
export default function LoginForm({
  switchMode,
  handleLogin,
  formData,
  showPassword,
  setShowPassword,
  handleInput,
  onForgotPassword,
}) {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>
      <div className="flex items-center justify-center space-x-4 mb-6 text-sm text-gray-500">
        <div className="flex items-center space-x-1">
          <ShieldCheck color="green" />
          <span>Secure</span>
        </div>
        <div className="flex items-center space-x-1">
          <Zap color="purple" />
          <span>Fast</span>
        </div>
      </div>
      <div className="space-y-3 mb-6">
        <button className="flex justify-center space-x-2 border-2 border-gray300 rounded-xl w-full items-center py-3 px-4 transition-all hover:shadow-md hover:bg-gray-50 bg-white">
          <span>
            <img
              src="/assets/google.png"
              style={{ height: "20px" }}
              alt="google"
            />
          </span>
          <span className="font-semibold text-gray-700">Continue with Google</span>
        </button>
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray300">
              Or continue with email
            </span>
          </div>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-gray300" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInput("email", e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-300 bg-white shadow-sm"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-gray300" />
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInput("password", e.target.value)}
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

          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl px-5 py-3 hover:opacity-90 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
          >
            Sign in
          </button>
        </form>

        <div className="text-sm text-center mt-2">
          <button
            onClick={onForgotPassword}
            className="text-primary font-semibold hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Don't have an account?
          <button
            onClick={switchMode}
            className="text-primary ml-1 font-semibold hover:underline"
          >
            Sign Up
          </button>
        </p>
      </div>
    </>
  );
}
