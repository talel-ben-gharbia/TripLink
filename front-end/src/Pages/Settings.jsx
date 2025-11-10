import React, { useState, useEffect } from "react";
import {
  LogOut,
  Trash2,
  AlertTriangle,
  Shield,
  CheckCircle,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Navbar from "../Component/Navbar";
import { API_URL } from "../config";

function Settings() {
  const [user, setUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateData, setUpdateData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    travelStyles: [],
    interests: []
  });
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Signup options reused for editing
  const travelStylesOptions = [
    "Adventure",
    "Luxury",
    "Budget",
    "Cultural",
    "Beach",
    "Mountains",
  ];
  const interestsOptions = [
    "Photography",
    "Food",
    "Shopping",
    "Nature",
    "History",
    "Nightlife",
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        setUser({ 
          _id: "test123",
          firstName: "Test",
          lastName: "User",
          phone: "1234567890"
        });
        return;
      }

      try {
        console.log("Fetching user with token:", token);
        const res = await fetch(`${API_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Response status:", res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log("User data received:", data);
          setUser(data.user);
          setUpdateData({
            firstName: data.user.firstName || "",
            lastName: data.user.lastName || "",
            phone: data.user.phone || "",
            travelStyles: data.user.travelStyles || [],
            interests: data.user.interests || [],
          });
          setAvatarPreview(data.user.profileImage || null);
        } else {
          console.error("Failed to fetch user data, status:", res.status);
          // Try to get error message from response
          try {
            const errorData = await res.json();
            console.error("Error response:", errorData);
          } catch (e) {
            console.error("Could not parse error response");
          }
          // Set a test user for now to show the UI
          setUser({
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
            phone: "1234567890",
          });
        }
      } catch (err) {
        console.error("Fetch user error:", err);
        // Set a test user for now to show the UI
        setUser({
          email: "test@example.com",
          firstName: "Test",
          lastName: "User",
          phone: "1234567890",
        });
      }
    };

    fetchUser();
  }, []);

  const handleUpdateProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setUpdateSuccess("Profile updated successfully!");
        setUpdateError("");
        setTimeout(() => {
          setShowUpdateForm(false);
          setUpdateSuccess("");
        }, 2000);
      } else {
        setUpdateError(data.error || "Failed to update profile");
        setUpdateSuccess("");
      }
    } catch (err) {
      console.error("Update error:", err);
      setUpdateError("Failed to update profile");
      setUpdateSuccess("");
    }
  };

  const toggleSelection = (key, item) => {
    setUpdateData((prev) => {
      const current = prev[key] || [];
      const exists = current.includes(item);
      return {
        ...prev,
        [key]: exists ? current.filter((v) => v !== item) : [...current, item],
      };
    });
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUser((u) => ({ ...u, profileImage: data.user.profileImage }));
      } else {
        alert(data.error || "Failed to update avatar");
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      alert("Failed to update avatar");
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Password is required");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/account/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Account deleted successfully");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        setDeleteError(data.error || "Failed to delete account");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError("Failed to delete account");
    }
  };

  const handleChangePassword = async () => {
    setPwdError("");
    setPwdSuccess("");
    // Basic validations
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdError("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8 ||
        !/(?=.*[a-z])/.test(newPassword) ||
        !/(?=.*[A-Z])/.test(newPassword) ||
        !/(?=.*\d)/.test(newPassword)) {
      setPwdError("Password must be at least 8 chars and include upper, lower, and a number.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setPwdError("You must be logged in to change password.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/account/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setPwdSuccess(data.message || "Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPwdError(data.error || "Failed to change password.");
      }
    } catch (err) {
      console.error("Change password error:", err);
      setPwdError("Failed to change password.");
    }
  };

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <Navbar openAuth={() => { }} />
          <div className="container mx-auto px-4 py-8">
            <p>Loading settings... Please wait</p>
            <p className="text-sm text-gray-500 mt-2">If this takes too long, please refresh the page or check your internet connection.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen page-bg">
        <Navbar openAuth={() => { }} />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Security Settings
          </h1>

          {/* Update Profile */}
          <div className="glass-card p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Shield className="text-blue-600" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Update Profile
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  Update your personal information.
                </p>
                <button
                  onClick={() => setShowUpdateForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update Profile
                </button>
              </div>
            </div>

            {showUpdateForm && (
              <div className="mt-4 p-6 bg-blue-50 border-2 border-blue-300 rounded-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Update Your Profile Information</h3>
                
                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                      {avatarPreview ? (
                        <img src={avatarPreview.startsWith('http') ? avatarPreview : `${API_URL}/uploads/profiles/${avatarPreview}`} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">No Image</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={updateData.firstName}
                        onChange={(e) =>
                          setUpdateData({ ...updateData, firstName: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        placeholder="Enter your first name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={updateData.lastName}
                        onChange={(e) =>
                          setUpdateData({ ...updateData, lastName: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email (cannot be changed)</label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      placeholder="Email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={updateData.phone}
                      onChange={(e) =>
                        setUpdateData({ ...updateData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* Travel Styles */}
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700">Travel Styles</label>
                    <div className="grid grid-cols-2 gap-3">
                      {travelStylesOptions.map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => toggleSelection("travelStyles", style)}
                          className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all transform hover:scale-105 shadow-sm ${updateData.travelStyles.includes(style)
                              ? "bg-primary text-white border-primary shadow-lg"
                              : "bg-white border-gray-300 hover:border-primary"
                            }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interests */}
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700">Interests (Select all that apply)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {interestsOptions.map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleSelection("interests", interest)}
                          className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all transform hover:scale-105 shadow-sm ${updateData.interests.includes(interest)
                              ? "bg-primary text-white border-purple-600 shadow-lg"
                              : "bg-white border-gray-300 hover:border-primary"
                            }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {updateError && (
                  <p className="text-red-600 text-sm mt-4">{updateError}</p>
                )}
                {updateSuccess && (
                  <p className="text-green-600 text-sm mt-4">{updateSuccess}</p>
                )}

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={handleUpdateProfile}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Save All Changes
                  </button>
                  <button
                    onClick={() => {
                      setShowUpdateForm(false);
                      setUpdateError("");
                      setUpdateSuccess("");
                    }}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="glass-card p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <CheckCircle className="text-purple-600" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Change Password
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  Update your password. Email cannot be changed.
                </p>

                <button
                  onClick={() => setShowPasswordSection((s) => !s)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <span>{showPasswordSection ? "Hide" : "Show"} Change Password</span>
                  {showPasswordSection ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {showPasswordSection && (
                  <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPwd ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all pr-10"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPwd((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          aria-label="Toggle password visibility"
                        >
                          {showCurrentPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPwd ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all pr-10"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPwd((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          aria-label="Toggle password visibility"
                        >
                          {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Min 8 chars, include upper, lower, number.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPwd ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all pr-10"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPwd((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          aria-label="Toggle password visibility"
                        >
                          {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  {pwdError && <p className="text-red-600 text-sm mt-4">{pwdError}</p>}
                  {pwdSuccess && <p className="text-green-600 text-sm mt-4">{pwdSuccess}</p>}

                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={handleChangePassword}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Update Password
                    </button>
                  </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Delete Account */}
          <div className="glass-card p-6">
            <div className="flex items-start space-x-4 mb-6">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Delete Account
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>

            {showDeleteConfirm && (
              <div className="mt-4 p-6 bg-red-50 border-2 border-red-300 rounded-md">
                <div className="flex items-start space-x-3 mb-4">
                  <AlertTriangle className="text-red-600 mt-1" size={24} />
                  <div className="flex-1">
                    <h3 className="text-red-800 font-bold text-lg mb-2">
                      ⚠️ Warning: This action is irreversible!
                    </h3>
                    <p className="text-red-700 mb-4">
                      Deleting your account will permanently remove all your
                      data including:
                    </p>
                    <ul className="list-disc list-inside text-red-700 mb-4 space-y-1">
                      <li>Your profile information</li>
                      <li>Travel preferences and personality assessments</li>
                      <li>All saved data and preferences</li>
                    </ul>
                    <p className="text-red-800 font-semibold mb-4">
                      This action cannot be undone. Are you absolutely sure?
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm with your password:
                    </label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => {
                        setDeletePassword(e.target.value);
                        setDeleteError("");
                      }}
                      className="w-full px-4 py-2 border-2 border-red-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your password"
                    />
                    {deleteError && (
                      <p className="text-red-600 text-sm mt-2">{deleteError}</p>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={!deletePassword}
                      className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Yes, Delete My Account
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeletePassword("");
                        setDeleteError("");
                      }}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Settings;
