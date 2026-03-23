import { useState } from "react";
import api from "../../services/api";
import {
  UserPlusIcon,
  TrashIcon,
  PencilSquareIcon,
  UsersIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import Pagination from "../../components/Pagination";
import SearchBar from "../../components/SearchBar";
import UserAvatar from "../../components/UserAvatar";
import { usePaginatedFetch } from "../../hooks/usePaginatedFetch";

const INITIAL_FORM = { name: "", email: "", password: "", role: "cashier", avatar: null };

const ROLE_BADGE = {
  admin: "bg-rose-50 text-rose-700 border border-rose-100",
  manager: "bg-amber-50 text-amber-700 border border-amber-100",
  cashier: "bg-emerald-50 text-emerald-700 border border-emerald-100",
};

export default function Users() {
  const { user: currentUser } = useAuth();
  const [roleFilter, setRoleFilter] = useState("");

  const {
    items: users,
    loading,
    pagination,
    searchTerm,
    setSearchTerm,
    setPage,
    handleSearch,
    handleClear,
    refresh,
  } = usePaginatedFetch("/users", { role: roleFilter });

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [preview, setPreview] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, password: "", role: user.role, avatar: null });
      setPreview(user.avatar);
    } else {
      setEditingUser(null);
      setFormData(INITIAL_FORM);
      setPreview(null);
    }
    setModalOpen(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avatar: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = new FormData();
      body.append("name", formData.name);
      body.append("email", formData.email);
      body.append("role", formData.role);
      if (formData.password) body.append("password", formData.password);
      if (formData.avatar) body.append("avatar", formData.avatar);

      if (editingUser) {
        body.append("_method", "PUT");
        await api.post(`/users/${editingUser.id}`, body);
        alert("User updated successfully");
      } else {
        await api.post("/users", body);
        alert("User created successfully");
      }

      setModalOpen(false);
      refresh();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving user");
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser.id) return alert("You cannot delete yourself.");
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      alert("User deleted successfully");
      refresh();
    } catch (err) {
      alert("Cannot delete: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading && users.length === 0)
    return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-indigo-50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <UsersIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">Admin Users</h1>
              <p className="text-sm text-gray-600 font-medium">
                Manage admin, manager, and cashier accounts.
              </p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
          >
            <UserPlusIcon className="h-5 w-5" /> Add User
          </button>
        </div>

        {/* Filters */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <form onSubmit={handleSearch} className="sm:col-span-3 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                Search
              </label>
              <SearchBar
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={handleClear}
                placeholder="Search by name or email..."
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-extrabold text-gray-700 hover:bg-slate-50 shadow-sm transition-all"
              >
                Search
              </button>
            </div>
          </form>
          <div>
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 shadow-sm"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white shadow-sm overflow-hidden rounded-2xl border border-gray-200 flex flex-col">
        {/* Desktop Header */}
        <div className="hidden md:block">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            <div className="col-span-4">Name &amp; Profile</div>
            <div className="col-span-4">Email Address</div>
            <div className="col-span-2">Access Role</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
        </div>

        <ul className="divide-y divide-gray-100 flex-1">
          {users.map((user) => {
            const roleBadge = ROLE_BADGE[user.role] ?? ROLE_BADGE.cashier;
            const actionButtons = (
              <>
                <button
                  onClick={() => openModal(user)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white text-indigo-600 hover:bg-indigo-50 shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                </button>
                {user.id !== currentUser.id && (
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white text-rose-600 hover:bg-rose-50 shadow-sm transition-all hover:scale-105 active:scale-95"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </>
            );

            return (
              <li key={user.id} className="px-4 py-4 sm:px-6 hover:bg-slate-50/50 transition-colors">
                {/* Mobile */}
                <div className="md:hidden flex items-start justify-between gap-3">
                  <div className="min-w-0 flex items-start gap-3">
                    <UserAvatar avatar={user.avatar} name={user.name} />
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-gray-900 truncate">{user.name}</div>
                      <div className="text-xs text-gray-500 font-semibold truncate uppercase tracking-tighter">
                        ID: {user.id}
                      </div>
                      <div className="text-xs font-bold text-slate-600 mt-1">{user.email}</div>
                      <span className={`mt-1 px-2 py-0.5 inline-flex text-[10px] font-black rounded-full uppercase tracking-widest ${roleBadge}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">{actionButtons}</div>
                </div>

                {/* Desktop */}
                <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <UserAvatar avatar={user.avatar} name={user.name} />
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-gray-900 truncate">{user.name}</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Ref: {user.id}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-4 min-w-0">
                    <div className="text-sm font-bold text-slate-700 truncate">{user.email}</div>
                  </div>
                  <div className="col-span-2">
                    <span className={`px-2.5 py-1 inline-flex text-[10px] font-black rounded-full uppercase tracking-widest ${roleBadge}`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">{actionButtons}</div>
                </div>
              </li>
            );
          })}
        </ul>

        {users.length === 0 && !loading && (
          <div className="px-6 py-16 text-center text-gray-500 bg-slate-50/50 flex flex-col items-center">
            <UsersIcon className="mx-auto h-16 w-16 text-slate-200 mb-4" />
            <h3 className="text-lg font-black text-slate-900">No users found</h3>
            <p className="text-sm font-bold text-slate-500 mt-1">Try adjusting your search or filters.</p>
          </div>
        )}

        <Pagination
          currentPage={pagination.currentPage}
          lastPage={pagination.lastPage}
          onPageChange={setPage}
          totalItems={pagination.total}
          fromItem={pagination.from}
          toItem={pagination.to}
        />
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="relative w-full max-w-xl overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {editingUser ? "Edit User Record" : "Create New User"}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex justify-center mb-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-400 group-hover:bg-white shadow-inner">
                      {preview ? (
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <PhotoIcon className="w-10 h-10 text-slate-300 group-hover:text-indigo-400" />
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2.5 rounded-2xl shadow-xl cursor-pointer hover:bg-slate-900 hover:scale-110 transition-all active:scale-95">
                      <PhotoIcon className="w-4 h-4" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    </label>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="johndoe@example.com"
                    />
                  </div>

                  {/* Password + Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest">
                          Password
                        </label>
                        {editingUser && (
                          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter bg-indigo-50 px-1.5 py-0.5 rounded-md">
                            Optional
                          </span>
                        )}
                      </div>
                      <input
                        type="password"
                        required={!editingUser}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2">
                        Access Role
                      </label>
                      <div className="relative">
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                        >
                          <option value="cashier">Cashier</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Administrator</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-4 border-2 border-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 hover:text-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-200 hover:bg-slate-900 hover:shadow-slate-400 transition-all active:scale-95"
                  >
                    {editingUser ? "Sync Record" : "Grant Access"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
