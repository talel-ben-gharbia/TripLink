import Button from "./Button";
import { ShieldCheck } from "lucide-react";
import { Zap } from "lucide-react";
import { Mail } from 'lucide-react';
import { Lock } from 'lucide-react';
import { Eye } from 'lucide-react';
import { EyeOff } from 'lucide-react';
export default function LoginForm({ switchMode ,handleLogin,formData,showPassword,setShowPassword}) {
  
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
        <button className="flex justify-center space-x-2 border py-3 border-gray300 rounded-lg w-full items-center transition-all hover:shadow-md">
          <span>
            <img
              src="/assets/google.png"
              style={{ height: "20px" }}
              alt="google"
            />
          </span>
          <span className="font-medium">Continue with Google</span>
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
            <Mail className="absolute left-4 top-4 text-gray300"/>
            <input
              type="email"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-300 bg-white shadow-sm"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-gray300"/>
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-300 bg-white shadow-sm"
              placeholder="password"
              required
            />
            <div className="absolute right-4 top-4 hover:scale-110 transition-transform" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <Eye className="text-gray300"/> : <EyeOff className="text-gray300"/>}
              </div>
          </div>

          <button type="submit" className="bg-primary rounded-md text-white px-5 py-2 hover:scale-[1.02] transition-transform shadow-md ">
          Sign in
        </button>
        </form>

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
