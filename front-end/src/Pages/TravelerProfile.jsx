import React, { useState, useEffect, useCallback } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { Save, User } from "lucide-react";
import { API_URL } from "../config";
import Navbar from "../Component/Navbar";

function TravelerProfile() {
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

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
          if (data.user.personalityAxis) {
            setPersonalityAxis(data.user.personalityAxis);
          }
          if (data.user.preferenceCategories) {
            setPreferences(data.user.preferenceCategories);
          }
        }
      })
      .catch((err) => console.error("Failed to load profile:", err));
  }, []);



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
        <div className="glass-card p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-xl">
                <User className="text-white" size={48} />
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-gray-700 text-lg font-medium">Customize your travel preferences and personality</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
                {saving && (
                  <span className="text-sm text-blue-700 flex items-center bg-blue-100 px-6 py-3 rounded-full font-bold shadow-md">
                    <Save className="mr-2 animate-spin" size={18} /> Auto-saving...
                  </span>
                )}
                {lastSaved && !saving && (
                  <span className="text-sm text-green-700 flex items-center bg-green-100 px-6 py-3 rounded-full font-bold shadow-md">
                    <Save className="mr-2" size={18} /> Last saved: {" "}
                    {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>
          </div>

          {/* 8-Axis Personality Assessment */}
          <div className="glass-card p-8 mb-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Personality Assessment
                </h2>
                <p className="text-gray-600 text-lg">Discover your travel personality across 8 key dimensions</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                <div className="icon-activity text-white text-2xl"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              {Object.entries(personalityAxis).map(([axis, value]) => (
                <div key={axis} className="space-y-4 p-6 bg-white/50 rounded-2xl border border-white/30 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-center">
                    <label className="text-lg font-bold text-gray-800 capitalize flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${value >= 80 ? 'bg-green-500' :
                          value >= 60 ? 'bg-blue-500' :
                            value >= 40 ? 'bg-yellow-500' :
                              value >= 20 ? 'bg-orange-500' : 'bg-red-500'
                        }`}></div>
                      {axis.replace(/([A-Z])/g, " $1").trim()}
                    </label>
                    <span className="text-xl font-bold text-gray-900 bg-white px-4 py-2 rounded-full shadow-sm">
                      {value}%
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={value}
                      onChange={(e) =>
                        updatePersonalityAxis(axis, parseInt(e.target.value))
                      }
                      className="w-full h-3 rounded-lg appearance-none cursor-pointer slider-custom accent-purple-600"
                      style={getSliderTrackStyle(value)}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Radar Chart Visualization */}
            <div className="glass-card p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                  <div className="icon-chart-bar text-white text-xl"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Your Travel Personality Radar
                </h3>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-2xl border border-white/50">
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    data={radarData}
                  >
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={({ payload, x, y, cx, cy, ...rest }) => (
                        <text
                          {...rest}
                          y={y + (y - cy) / 10}
                          x={x + (x - cx) / 20}
                          className="text-sm font-bold text-gray-700 fill-current"
                        >
                          {payload.value}
                        </text>
                      )}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      axisLine={false}
                      tick={false}
                    />
                    <Radar
                      name="Personality"
                      dataKey="value"
                      stroke="#8b5cf6" // purple-500
                      fill="#8b5cf6"
                      fillOpacity={0.2}
                      strokeWidth={2}
                      dot={{
                        r: 4,
                        strokeWidth: 2,
                        stroke: "#8b5cf6",
                        fill: "#fff",
                      }}
                      activeDot={{ r: 6, stroke: "#8b5cf6", fill: "#fff" }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-600 font-medium">Your unique travel personality fingerprint</p>
              </div>
            </div>
          </div>

          {/* 16-Category Preference Grid */}
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Travel Preferences
                </h2>
                <p className="text-gray-600 text-lg">Fine-tune your preferences across 16 categories</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center">
                <div className="icon-star text-white text-2xl"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {preferenceCategories.map((category) => (
                <div key={category.title} className="space-y-6 p-6 bg-white/50 rounded-2xl border border-white/30 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${category.title === 'Accommodation' ? 'bg-blue-500' :
                        category.title === 'Activities' ? 'bg-green-500' :
                          category.title === 'Food' ? 'bg-orange-500' : 'bg-purple-500'
                      }`}></div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {category.title}
                    </h3>
                  </div>
                  {category.items.map((item) => (
                    <div key={item} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-base font-bold text-gray-700 capitalize flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${preferences[item] >= 80 ? 'bg-green-500' :
                              preferences[item] >= 60 ? 'bg-blue-500' :
                                preferences[item] >= 40 ? 'bg-yellow-500' :
                                  preferences[item] >= 20 ? 'bg-orange-500' : 'bg-red-500'
                            }`}></div>
                          {item.replace(/([A-Z])/g, " $1").trim()}
                        </label>
                        <span className="text-lg font-bold text-gray-900 bg-white px-3 py-1 rounded-full shadow-sm">
                          {preferences[item]}%
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={preferences[item]}
                          onChange={(e) =>
                            updatePreference(item, parseInt(e.target.value))
                          }
                          className="w-full h-3 rounded-lg appearance-none cursor-pointer slider-custom accent-blue-600"
                          style={getSliderTrackStyle(preferences[item])}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>Low</span>
                          <span>High</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-white/50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <div className="icon-info text-white text-lg"></div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800">Pro Tip</h4>
                  <p className="text-gray-700">Your preferences are automatically saved as you adjust them. Use the radar chart above to see your overall travel personality!</p>
                </div>
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
