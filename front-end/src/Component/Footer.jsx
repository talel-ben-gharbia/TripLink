import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Linkedin, Twitter, Instagram, ShieldCheck, Lock, Award } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 px-4 border-t border-gray-700" id="footer">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white" />
            </div>
            <span className="text-2xl font-bold">Trip Link</span>
          </div>
          <p className="text-gray-400">Your trusted travel companion</p>
          <p className="text-gray-500 text-sm mt-2">Secure, global, 24/7 support</p>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-lg">Company</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link to="/about" className="hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">About Us</Link></li>
            <li><Link to="/careers" className="hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">Careers</Link></li>
            <li><Link to="/press" className="hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">Press</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-lg">Support</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link to="/help" className="hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">Help Center</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">Contact Us</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-lg">Connect With Us</h4>
          <div className="flex space-x-4 mb-4">
            <button type="button" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="LinkedIn"><Linkedin /></button>
            <button type="button" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="Twitter"><Twitter /></button>
            <button type="button" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="Instagram"><Instagram /></button>
          </div>
          <div className="flex space-x-3">
            <ShieldCheck className="text-green-500" />
            <Lock className="text-blue-500" />
            <Award className="text-yellow-500" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-400">Language</label>
              <select className="mt-1 w-full bg-white/10 text-white rounded-lg px-3 py-2 border border-gray-800">
                <option>English</option>
                <option>Français</option>
                <option>Español</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">Currency</label>
              <select className="mt-1 w-full bg-white/10 text-white rounded-lg px-3 py-2 border border-gray-800">
                <option>USD</option>
                <option>EUR</option>
                <option>MAD</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-400">
        <div>
          <h5 className="font-semibold text-white mb-3">Quick Links</h5>
          <ul className="space-y-2">
            <li><a href="/destinations" className="hover:text-white transition-colors">Destinations</a></li>
            <li><a href="/collections" className="hover:text-white transition-colors">Collections</a></li>
            <li><a href="/" className="hover:text-white transition-colors">Support</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold text-white mb-3">Resources</h5>
          <ul className="space-y-2">
            <li><button type="button" className="hover:text-white">Travel tips</button></li>
            <li><button type="button" className="hover:text-white">Blog</button></li>
            <li><button type="button" className="hover:text-white">Privacy</button></li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold text-white mb-3">Contact</h5>
          <p>Email: support@triplink.com</p>
          <p>Phone: +1 (555) 555-5555</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
        <p>© {new Date().getFullYear()} Trip Link. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
