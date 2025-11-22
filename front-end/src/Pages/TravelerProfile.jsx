import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { Save, User, RefreshCw, Heart, MapPin, Star } from "lucide-react";

import Navbar from "../Component/Navbar";
import { API_URL } from "../config";

function TravelerProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [preferencesSubTab, setPreferencesSubTab] = useState("personality");
  const [settingsSubTab, setSettingsSubTab] = useState("account");
  const [accountData, setAccountData] = useState({ firstName: "", lastName: "", phone: "" });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [pwdMsg, setPwdMsg] = useState({ error: "", success: "" });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteMsg, setDeleteMsg] = useState({ error: "", success: "" });
  const tabs = useMemo(() => ["overview", "preferences", "wishlist", "settings"], []);

  // 8-axis personality assessment
  const [personalityAxis, setPersonalityAxis] = useState({
    adventurous: 50,
    cultural: 50,
    luxury: 50,
    budget: 50,
    spontaneous: 50,
    planned: 50,
    social: 50,
    solo: 50,
  });

  const axisDescriptions = {
    adventurous: "Thrill-seeking and open to new challenges",
    cultural: "Enjoys museums, history and local traditions",
    luxury: "Prefers high-end stays and premium experiences",
    budget: "Optimizes for savings and value",
    spontaneous: "Flexible and enjoys last-minute plans",
    planned: "Prefers detailed itineraries and structure",
    social: "Enjoys group activities and meeting people",
    solo: "Prefers independent travel and quiet time",
  };

  // 16-category preference grid
  const [preferences, setPreferences] = useState({
    // Accommodation
    hotels: 50,
    hostels: 50,
    apartments: 50,
    resorts: 50,
    // Activities
    adventure: 50,
    culture: 50,
    nature: 50,
    nightlife: 50,
    // Food
    local: 50,
    fineDining: 50,
    streetFood: 50,
    vegetarian: 50,
    // Transportation
    flights: 50,
    trains: 50,
    buses: 50,
    cars: 50,
  });

  const completion = useMemo(() => {
    const values = [
      ...Object.values(personalityAxis),
      ...Object.values(preferences),
    ];
    if (!values.length) return 0;
    const sum = values.reduce((a, b) => a + (parseInt(b) || 0), 0);
    return Math.round(sum / values.length);
  }, [personalityAxis, preferences]);

  const topPreferences = useMemo(() => {
    return Object.entries(preferences)
      .sort((a, b) => (b[1] || 0) - (a[1] || 0))
      .slice(0, 6)
      .map(([key, value]) => ({ key, value }));
  }, [preferences]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }

    fetch("http://127.0.0.1:8000/api/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setAccountData({ firstName: data.user.firstName || "", lastName: data.user.lastName || "", phone: data.user.phone || "" });
          setAvatarPreview(data.user.profileImage || null);
          if (data.user.personalityAxis) {
            setPersonalityAxis(data.user.personalityAxis);
          }
          if (data.user.preferenceCategories) {
            setPreferences(data.user.preferenceCategories);
          }
          // load wishlist for the profile
          setWishlistLoading(true);
          fetch("http://127.0.0.1:8000/api/wishlist", {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((items) => setWishlist(Array.isArray(items) ? items : []))
            .catch(() => setWishlist([]))
            .finally(() => setWishlistLoading(false));
        }
      })
      .catch((err) => console.error("Failed to load profile:", err));
  }, []);

  const handleTabKeyDown = useCallback((e) => {
    const currentIndex = tabs.indexOf(activeTab);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = tabs[(currentIndex + 1) % tabs.length];
      setActiveTab(next);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
      setActiveTab(prev);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveTab(tabs[0]);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveTab(tabs[tabs.length - 1]);
    }
  }, [activeTab, tabs]);



  const saveProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSaving(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          personalityAxis,
          preferenceCategories: preferences,
        }),
      });

      if (res.ok) {
        setLastSaved(new Date());
        setTimeout(() => setSaving(false), 500);
      } else {
        setSaving(false);
        alert("Failed to save profile");
      }
    } catch (err) {
      console.error("Save error:", err);
      setSaving(false);
      alert("Failed to save profile");
    }
  }, [personalityAxis, preferences]);

  // Auto-save on every change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        saveProfile();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [personalityAxis, preferences, user, saveProfile]);



  const updatePersonalityAxis = (axis, value) => {
    setPersonalityAxis((prev) => ({
      ...prev,
      [axis]: Math.max(0, Math.min(100, value)),
    }));
  };

  const updatePreference = (category, value) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: Math.max(0, Math.min(100, value)),
    }));
  };

  const removeFromWishlist = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/wishlist/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setWishlist((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (e) {}
  };

  const clearWishlist = async () => {
    if (!window.confirm('Clear all wishlist items?')) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    for (const d of wishlist) {
      try {
        await fetch(`${API_URL}/api/wishlist/${d.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {}
    }
    setWishlist([]);
  };

  const saveAccount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(accountData),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user || { ...user, ...accountData });
      } else {
        alert(data.error || "Failed to update account");
      }
    } catch (err) {
      alert("Network error updating account");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    const token = localStorage.getItem("token");
    if (!token) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await fetch(`${API_URL}/api/profile/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUser((u) => ({ ...u, profileImage: data.user?.profileImage || u.profileImage }));
      } else {
        alert(data.error || "Failed to update avatar");
      }
    } catch (err) {
      alert("Failed to update avatar");
    }
  };

  const handleChangePassword = async () => {
    setPwdMsg({ error: "", success: "" });
    if (!pwd.current || !pwd.next || !pwd.confirm) {
      setPwdMsg({ error: "Please fill in all fields.", success: "" });
      return;
    }
    if (pwd.next !== pwd.confirm) {
      setPwdMsg({ error: "New passwords do not match.", success: "" });
      return;
    }
    if (pwd.next.length < 8 || !/(?=.*[a-z])/.test(pwd.next) || !/(?=.*[A-Z])/.test(pwd.next) || !/(?=.*\d)/.test(pwd.next)) {
      setPwdMsg({ error: "Password must be 8+ chars with upper, lower, number.", success: "" });
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setPwdMsg({ error: "You must be logged in.", success: "" });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/account/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pwd.current, newPassword: pwd.next }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwd({ current: "", next: "", confirm: "" });
        setPwdMsg({ error: "", success: data.message || "Password changed successfully." });
      } else {
        setPwdMsg({ error: data.error || "Failed to change password.", success: "" });
      }
    } catch (err) {
      setPwdMsg({ error: "Failed to change password.", success: "" });
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteMsg({ error: "", success: "" });
    if (!deletePassword) {
      setDeleteMsg({ error: "Password is required.", success: "" });
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/account/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setDeleteMsg({ error: "", success: data.message || "Account deleted." });
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTimeout(() => { window.location.href = "/"; }, 1500);
      } else {
        setDeleteMsg({ error: data.error || "Failed to delete account.", success: "" });
      }
    } catch (err) {
      setDeleteMsg({ error: "Failed to delete account.", success: "" });
    }
  };

  const resetPersonality = () => {
    const base = Object.keys(personalityAxis).reduce((acc, k) => { acc[k] = 50; return acc; }, {});
    setPersonalityAxis(base);
  };

  // randomize removed per request

  const resetCategories = () => {
    const base = Object.keys(preferences).reduce((acc, k) => { acc[k] = 50; return acc; }, {});
    setPreferences(base);
  };

  const getSliderTrackStyle = (value) => {
    const percentage = value;
    const color =
      value >= 80
        ? "#22c55e" // green-500
        : value >= 60
          ? "#3b82f6" // blue-500
          : value >= 40
            ? "#facc15" // yellow-400
            : value >= 20
              ? "#f97316" // orange-500
              : "#ef4444"; // red-500

    return {
      background: `linear-gradient(to right, ${color} ${percentage}%, #e5e7eb ${percentage}%)`,
    };
  };

  // Prepare data for radar chart
  const radarData = [
    { axis: "Adventurous", value: personalityAxis.adventurous },
    { axis: "Cultural", value: personalityAxis.cultural },
    { axis: "Luxury", value: personalityAxis.luxury },
    { axis: "Budget", value: personalityAxis.budget },
    { axis: "Spontaneous", value: personalityAxis.spontaneous },
    { axis: "Planned", value: personalityAxis.planned },
    { axis: "Social", value: personalityAxis.social },
    { axis: "Solo", value: personalityAxis.solo },
  ];

  const preferenceCategories = [
    {
      title: "Accommodation",
      items: ["hotels", "hostels", "apartments", "resorts"],
    },
    {
      title: "Activities",
      items: ["adventure", "culture", "nature", "nightlife"],
    },
    {
      title: "Food",
      items: ["local", "fineDining", "streetFood", "vegetarian"],
    },
    { title: "Transportation", items: ["flights", "trains", "buses", "cars"] },
  ];

  function ProfileSummary({ wishlist, lastSaved, saving, completion }) {
    return (
      <div>
        <div className="mb-6 bg-white rounded-2xl p-6 shadow-lg border border-white/60">
          <div className="flex justify-between text-sm mb-3">
            <span className="font-bold text-gray-800">Profile Completion</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">{completion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-500 h-3 rounded-full" style={{ width: `${completion}%` }} />
          </div>
          <div className="text-xs text-gray-600 flex items-center justify-between">
            <span>{saving ? "Auto-saving..." : lastSaved ? `Last saved ${lastSaved.toLocaleTimeString()}` : "Not yet saved"}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-4 bg-white rounded-xl shadow-md">
            <div className="text-xs text-gray-500 mb-1">Wishlist</div>
            <div className="text-xl font-bold text-purple-600">{wishlist.length}</div>
          </div>
          <div className="text-center p-4 bg-white rounded-xl shadow-md">
            <div className="text-xs text-gray-500 mb-1">Axes</div>
            <div className="text-xl font-bold text-blue-600">8</div>
          </div>
          <div className="text-center p-4 bg-white rounded-xl shadow-md">
            <div className="text-xs text-gray-500 mb-1">Categories</div>
            <div className="text-xl font-bold text-green-600">16</div>
          </div>
        </div>
      </div>
    );
  }

  function TopPreferences({ items }) {
    const emoji = (k) => ({
      hotels: "🏨",
      hostels: "🛌",
      apartments: "🏢",
      resorts: "🏝️",
      adventure: "🧗",
      culture: "🎭",
      nature: "🌿",
      nightlife: "🌃",
      local: "🍲",
      fineDining: "🍽️",
      streetFood: "🌮",
      vegetarian: "🥗",
      flights: "✈️",
      trains: "🚆",
      buses: "🚌",
      cars: "🚗",
    }[k] || "✨");
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/60">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Top Preferences</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((it) => (
            <span key={it.key} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-50 text-purple-700 border border-purple-100">
              <span className="mr-2">{emoji(it.key)}</span>
              {it.key.replace(/([A-Z])/g, " $1").trim()} <span className="ml-2 text-xs text-gray-600">{it.value}%</span>
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <Navbar openAuth={() => { }} />
          <div className="container mx-auto px-4 py-8">
            <p>Loading...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen page-bg">
        <Navbar openAuth={() => { }} />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="glass-card p-8 mb-8 glass-ring ambient-glow animate-fade-up">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-white">
                  <User className="text-white" size={44} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {user.firstName} {user.lastName}
                  </h1>
                  <div className="text-gray-500 text-sm">{user.email}</div>
                  <p className="text-gray-700 text-base font-medium mt-1">Customize your travel preferences and personality</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {saving && (
                  <span className="text-sm text-blue-700 flex items-center bg-blue-100 px-4 py-2 rounded-full font-semibold shadow">
                    <Save className="mr-2 animate-spin" size={16} /> Auto-saving...
                  </span>
                )}
                {lastSaved && !saving && (
                  <span className="text-sm text-green-700 flex items-center bg-green-100 px-4 py-2 rounded-full font-semibold shadow">
                    <Save className="mr-2" size={16} /> Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
                <div className="relative bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 rounded-2xl shadow-2xl p-6 border border-purple-200 overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-300 rounded-full blur-3xl opacity-20"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-300 rounded-full blur-3xl opacity-20"></div>
                  <div className="relative z-10">
                    <div className="text-center mb-6">
                      <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                        <div className="icon-user text-4xl text-white"></div>
                      </div>
                      <h2 className="text-xl font-bold mb-1">{user.firstName} {user.lastName}</h2>
                      <p className="text-gray-600 text-sm">Member</p>
                    </div>
                    <ProfileSummary wishlist={wishlist} lastSaved={lastSaved} saving={saving} completion={completion} />
                  </div>
                </div>
                <TopPreferences items={topPreferences} />
              </div>
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-2xl p-6 border border-purple-50">
                  <div className="flex gap-6 mb-6 border-b" role="tablist" aria-label="Profile sections" onKeyDown={handleTabKeyDown}>
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 px-5 capitalize relative z-10 ${activeTab === tab
                          ? "border-b-2 border-purple-600 text-purple-600 font-semibold"
                          : "text-gray-600 hover:text-purple-600"
                          }`}
                        role="tab"
                        aria-selected={activeTab === tab}
                        aria-controls={`panel-${tab}`}
                        id={tab}
                        style={{ pointerEvents: "auto" }}
                      >
                        {tab === "wishlist" ? (
                          <span className="inline-flex items-center">
                            wishlist
                            <span className="ml-2 inline-flex items-center justify-center min-w-[22px] h-5 px-2 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">{wishlist.length}</span>
                          </span>
                        ) : (
                          tab
                        )}
                      </button>
                    ))}
                  </div>
                  {activeTab === "overview" && (
                    <div id="panel-overview" role="tabpanel" aria-labelledby="overview" className="space-y-6">
                      <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <label className="text-xs text-gray-600">Name</label>
                            <p className="text-base font-semibold text-gray-800">{user.firstName} {user.lastName}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <label className="text-xs text-gray-600">Email</label>
                            <p className="text-base font-semibold text-gray-800">{user.email || '—'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <label className="text-xs text-gray-600">Last Saved</label>
                            <p className="text-base font-semibold text-gray-800">{lastSaved ? lastSaved.toLocaleTimeString() : 'Not yet saved'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <label className="text-xs text-gray-600">Profile Completion</label>
                            <p className="text-base font-semibold text-gray-800">{completion}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === "preferences" && (
                    <div id="panel-preferences" role="tabpanel" aria-labelledby="preferences" className="space-y-8">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">Travel Preferences</h2>
                          <p className="text-gray-600">Fine-tune your preferences</p>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center">
                          <div className="icon-star text-white text-xl"></div>
                        </div>
                      </div>
                      <div className="flex space-x-4 mb-6 border-b" role="tablist" aria-label="Preferences sections">
                        {['personality', 'categories'].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setPreferencesSubTab(t)}
                            className={`pb-3 px-4 capitalize relative z-10 ${preferencesSubTab === t
                              ? 'border-b-2 border-purple-600 text-purple-600 font-semibold'
                              : 'text-gray-600 hover:text-purple-600'
                              }`}
                            role="tab"
                            aria-selected={preferencesSubTab === t}
                            aria-controls={`subpanel-${t}`}
                            id={`pref-${t}`}
                          >
                            {t === 'personality' ? 'Personality Assessment' : 'Categories'}
                          </button>
                        ))}
                      </div>
                      {preferencesSubTab === 'personality' && (
                        <div id="subpanel-personality" role="tabpanel" aria-labelledby="pref-personality" className="space-y-8">
                          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-bold text-gray-800">Personality Assessment</h3>
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                                <div className="icon-activity text-white text-base"></div>
                              </div>
                            </div>
                            <div className="flex items-center justify-end mb-3 space-x-2">
                              <button type="button" onClick={resetPersonality} className="px-3 py-1 text-xs rounded-md border border-gray-300 hover:border-purple-500 hover:text-purple-700 bg-white shadow-sm flex items-center space-x-1">
                                <RefreshCw size={14} />
                                <span>Reset</span>
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {Object.entries(personalityAxis).map(([axis, value]) => (
                                <div key={axis} className="space-y-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center font-semibold text-gray-900 text-sm capitalize truncate" title={axisDescriptions[axis]}>
                                      <div className={`w-3 h-3 rounded-full mr-3 ${value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-blue-500' : value >= 40 ? 'bg-yellow-500' : value >= 20 ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                                      {axis.replace(/([A-Z])/g, ' $1').trim()}
                                    </div>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-bold whitespace-nowrap">{value}%</span>
                                  </div>
                                  <div className="relative">
                                    <input type="range" min="0" max="100" value={value} onChange={(e) => updatePersonalityAxis(axis, parseInt(e.target.value))} aria-label={`Adjust ${axis}`} className="w-full h-3 rounded-lg appearance-none cursor-pointer slider-custom accent-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2" style={getSliderTrackStyle(value)} />
                                    <div className="flex justify-between text-[11px] text-gray-500 mt-2"><span>Low</span><span>High</span></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-6">
                              <div className="flex items-center justify-center mb-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-md flex items-center justify-center mr-3">
                                  <div className="icon-chart-bar text-white text-sm"></div>
                                </div>
                                <h3 className="text-base font-bold text-gray-800">Personality Radar</h3>
                              </div>
                              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-3 rounded-xl border border-white/50">
                                <ResponsiveContainer width="100%" height={300}>
                                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="axis" tick={({ payload, x, y, cx, cy, ...rest }) => (
                                      <text {...rest} y={y + (y - cy) / 10} x={x + (x - cx) / 20} className="text-xs font-bold text-gray-700 fill-current">{payload.value}</text>
                                    )} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
                                    <Radar name="Personality" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} dot={{ r: 3, strokeWidth: 2, stroke: '#8b5cf6', fill: '#fff' }} activeDot={{ r: 5, stroke: '#8b5cf6', fill: '#fff' }} />
                                  </RadarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-white/50 animate-fade-up">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                <div className="icon-info text-white text-base"></div>
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-gray-800">Pro Tip</h4>
                                <p className="text-gray-700">Adjust the sliders to tune your travel personality.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {preferencesSubTab === 'categories' && (
                        <div id="subpanel-categories" role="tabpanel" aria-labelledby="pref-categories" className="space-y-8">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {preferenceCategories.map((category) => (
                              <div key={category.title} className="space-y-6 p-5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-up">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-4 h-4 rounded-full ${category.title === 'Accommodation' ? 'bg-blue-500' : category.title === 'Activities' ? 'bg-green-500' : category.title === 'Food' ? 'bg-orange-500' : 'bg-purple-500'}`}></div>
                                  <h3 className="text-xl font-bold text-gray-800">{category.title}</h3>
                                </div>
                                {category.items.map((item) => (
                                  <div key={item} className="space-y-3">
                                    <div className="flex justify-between items-center">
                                      <label className="text-sm font-semibold text-gray-900 capitalize flex items-center" title={`${item.replace(/([A-Z])/g, ' $1').trim()} preference level`}>
                                        <div className={`w-2 h-2 rounded-full mr-2 ${preferences[item] >= 80 ? 'bg-green-500' : preferences[item] >= 60 ? 'bg-blue-500' : preferences[item] >= 40 ? 'bg-yellow-500' : preferences[item] >= 20 ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                                        {item.replace(/([A-Z])/g, ' $1').trim()}
                                      </label>
                                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-bold whitespace-nowrap">{preferences[item]}%</span>
                                    </div>
                                    <div className="relative">
                                      <input type="range" min="0" max="100" value={preferences[item]} onChange={(e) => updatePreference(item, parseInt(e.target.value))} aria-label={`Adjust ${item}`} className="w-full h-3 rounded-lg appearance-none cursor-pointer slider-custom accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" style={getSliderTrackStyle(preferences[item])} />
                                      <div className="flex justify-between text-[11px] text-gray-500 mt-2"><span>Low</span><span>High</span></div>
                                    </div>
                                  </div>
                                ))}
                                <div className="flex items-center justify-end">
                                  <button type="button" onClick={resetCategories} className="px-3 py-1 text-xs rounded-md border border-gray-300 hover:border-purple-500 hover:text-purple-700 bg-white shadow-sm flex items-center space-x-1">
                                    <RefreshCw size={14} />
                                    <span>Reset All</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-white/50 animate-fade-up">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                <div className="icon-info text-white text-base"></div>
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-gray-800">Pro Tip</h4>
                                <p className="text-gray-700">Preferences auto-save and influence recommendations across the app.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "wishlist" && (
                    <div id="panel-wishlist" role="tabpanel" aria-labelledby="wishlist" className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800 mb-1">Your Wishlist</h2>
                          <p className="text-gray-600">Destinations you saved for later</p>
                        </div>
                        {wishlist.length > 0 && (
                          <button type="button" onClick={clearWishlist} className="px-3 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100">Clear all</button>
                        )}
                      </div>
                      {wishlistLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="rounded-2xl overflow-hidden border bg-white">
                              <div className="h-40 animate-shimmer" />
                              <div className="p-4 space-y-3">
                                <div className="h-6 w-2/3 bg-gray-200 rounded animate-shimmer" />
                                <div className="h-4 w-1/2 bg-gray-200 rounded animate-shimmer" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : wishlist.length === 0 ? (
                        <div className="bg-white/70 rounded-xl p-6 border border-white/40 text-center">
                          <p className="text-gray-700 mb-4">No items yet. Browse destinations and tap the heart to save.</p>
                          <button type="button" onClick={() => navigate('/destinations')} className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow">Browse destinations</button>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {wishlist.map((d) => {
                              const priceText = d.priceMin && d.priceMax ? `$${d.priceMin} – $${d.priceMax}` : (d.priceMin ? `$${d.priceMin}` : (d.price ? `$${d.price}` : ''));
                              return (
                                <div key={d.id} className="bg-white rounded-2xl shadow-md border overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
                                  <div className="relative aspect-[4/3]">
                                    <img src={d.image || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200'} alt={d.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=1200&auto=format&fit=crop&q=80'; }} />
                                    {d.rating && (
                                      <div className="absolute bottom-3 left-3 inline-flex items-center px-2.5 py-1 rounded-md bg-white/90 text-gray-900 shadow">
                                        <Star size={14} className="text-yellow-500 mr-1" />
                                        <span className="text-xs font-semibold">{d.rating}</span>
                                      </div>
                                    )}
                                    <button type="button" aria-label="Remove from wishlist" onClick={() => removeFromWishlist(d.id)} className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full shadow flex items-center justify-center">
                                      <Heart size={18} className="text-red-600" fill="currentColor" />
                                    </button>
                                  </div>
                                  <div className="p-4 flex flex-col gap-2 flex-1">
                                    <div className="text-sm text-gray-600 inline-flex items-center">
                                      <MapPin size={14} className="mr-1 text-gray-500" />
                                      {d.city ? `${d.city}, ${d.country}` : d.country}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">{d.name}</h3>
                                    <div className="text-xs text-gray-600">Saved: {new Date(d.wishlistedAt).toLocaleDateString()}</div>
                                    {priceText && (
                                      <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 text-gray-800 border border-gray-200">
                                        {priceText}
                                      </div>
                                    )}
                                    <div className="mt-auto flex items-center justify-between pt-2">
                                      <button type="button" onClick={() => navigate(`/destinations/${d.id}`)} className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow hover:opacity-90">View details</button>
                                      <button type="button" onClick={() => removeFromWishlist(d.id)} className="px-4 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">Remove</button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  {activeTab === "settings" && (
                    <div id="panel-settings" role="tabpanel" aria-labelledby="settings" className="space-y-8">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
                          <p className="text-gray-600">Manage your account and security</p>
                        </div>
                      </div>
                      <div className="flex space-x-4 mb-6 border-b" role="tablist" aria-label="Settings sections">
                        {['account', 'security'].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSettingsSubTab(t)}
                            className={`pb-3 px-4 capitalize relative z-10 ${settingsSubTab === t ? 'border-b-2 border-purple-600 text-purple-600 font-semibold' : 'text-gray-600 hover:text-purple-600'}`}
                            role="tab"
                            aria-selected={settingsSubTab === t}
                            aria-controls={`settings-${t}`}
                            id={`settings-${t}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      {settingsSubTab === 'account' && (
                        <div id="settings-account" role="tabpanel" aria-labelledby="settings-account" className="space-y-6">
                          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Account Info</h3>
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                                {avatarPreview ? (
                                  <img src={String(avatarPreview).startsWith('http') ? avatarPreview : `${API_URL}/uploads/profiles/${avatarPreview}`} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Image</div>
                                )}
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-2">Profile Picture</label>
                                <input type="file" accept="image/*" onChange={handleAvatarChange} className="text-xs" />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs text-gray-600 mb-2 block">First Name</label>
                                <input type="text" value={accountData.firstName} onChange={(e) => setAccountData({ ...accountData, firstName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600 mb-2 block">Last Name</label>
                                <input type="text" value={accountData.lastName} onChange={(e) => setAccountData({ ...accountData, lastName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                              </div>
                              <div className="md:col-span-2">
                                <label className="text-xs text-gray-600 mb-2 block">Phone</label>
                                <input type="tel" value={accountData.phone} onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                              </div>
                              <div className="md:col-span-2">
                                <label className="text-xs text-gray-600 mb-2 block">Email (read-only)</label>
                                <input type="email" value={user?.email || ''} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600" />
                              </div>
                            </div>
                            <div className="mt-4">
                              <button type="button" onClick={saveAccount} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Changes</button>
                            </div>
                          </div>
                        </div>
                      )}
                      {settingsSubTab === 'security' && (
                        <div id="settings-security" role="tabpanel" aria-labelledby="settings-security" className="space-y-6">
                          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Change Password</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <input type="password" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} placeholder="Current password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                              <input type="password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} placeholder="New password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                              <input type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} placeholder="Confirm new password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div className="mt-2 text-sm">
                              {pwdMsg.error && <p className="text-red-600 mb-2">{pwdMsg.error}</p>}
                              {pwdMsg.success && <p className="text-green-600 mb-2">{pwdMsg.success}</p>}
                              <button type="button" onClick={handleChangePassword} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update Password</button>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Account</h3>
                            <p className="text-gray-600 text-sm mb-3">This action is irreversible.</p>
                            <div className="space-y-3">
                              <button type="button" onClick={() => setDeleteConfirmOpen(!deleteConfirmOpen)} className="px-3 py-1 text-xs rounded-md border border-gray-300 hover:border-red-500 hover:text-red-600 bg-white shadow-sm">{deleteConfirmOpen ? 'Hide' : 'Show'} Confirmation</button>
                              {deleteConfirmOpen && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Enter password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
                                  <div className="md:col-span-2 flex items-center space-x-2">
                                    <button type="button" onClick={handleDeleteAccount} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete Account</button>
                                    {deleteMsg.error && <span className="text-red-600 text-sm">{deleteMsg.error}</span>}
                                    {deleteMsg.success && <span className="text-green-600 text-sm">{deleteMsg.success}</span>}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

}

export default TravelerProfile;
