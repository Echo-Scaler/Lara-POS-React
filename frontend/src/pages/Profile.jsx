import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import {
  UserIcon,
  KeyIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    password: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const data = new FormData();
      data.append("name", formData.name);
      if (formData.password) data.append("password", formData.password);
      if (avatar) data.append("avatar", avatar);
      data.append("_method", "PUT"); // Laravel requirement for multipart PUT requests

      const res = await api.post("/profile", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const updatedUser = res.data.data;
      
      // Update local storage if needed (but we mostly use AuthContext)
      setUser(updatedUser);

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setFormData((prev) => ({ ...prev, password: "" }));
      setAvatar(null);
    } catch (err) {
      console.error("Profile update error:", err.response?.data || err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            My Profile
          </h1>
          <p className="text-slate-500 font-semibold mt-1">
            Manage your account settings and security
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />
            
            <div className="relative">
              <div className="relative w-24 h-24 mx-auto group/avatar">
                {preview ? (
                  <img
                    src={preview}
                    alt={user?.name}
                    className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white transition-transform group-hover/avatar:scale-105 duration-500"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-slate-800 flex items-center justify-center text-white text-4xl font-black shadow-lg border-4 border-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                  <PhotoIcon className="h-4 w-4 text-slate-600" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              <h2 className="mt-4 text-xl font-black text-slate-900 leading-tight">
                {user?.name}
              </h2>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">
                {user?.role}
              </p>
              
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-left">
                <div className="flex items-center text-sm font-semibold text-slate-600">
                  <EnvelopeIcon className="h-4 w-4 mr-2.5 text-slate-400" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center text-sm font-semibold text-slate-600">
                  <ShieldCheckIcon className="h-4 w-4 mr-2.5 text-slate-400" />
                  <span className="capitalize">{user?.role} Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full">
            <form onSubmit={handleSubmit} className="space-y-6">
              {message.text && (
                <div
                  className={`flex items-center p-4 rounded-2xl ${
                    message.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-red-50 text-red-700 border border-red-100"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                  ) : (
                    <ExclamationCircleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                  )}
                  <p className="text-sm font-bold">{message.text}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2 px-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      minLength={3}
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2 px-1 text-slate-400">
                    Email address (Read Only)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-slate-300" />
                    </div>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ""}
                      className="block w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2 px-1">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <KeyIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                      placeholder="Minimum 8 characters"
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight px-1">
                    Enter your new password to update security
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2 px-1 text-slate-400">
                    User Role (Read Only)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <ShieldCheckIcon className="h-5 w-5 text-slate-300" />
                    </div>
                    <input
                      type="text"
                      disabled
                      value={user?.role?.toUpperCase() || ""}
                      className="block w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-slate-900 text-white text-sm font-black rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-slate-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Updating...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
