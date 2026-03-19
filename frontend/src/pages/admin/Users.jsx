import { useState, useEffect } from "react";
import api from "../../services/api";
import {
  UserPlusIcon,
  TrashIcon,
  PencilSquareIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import Pagination from "../../components/Pagination";

const initialFormState = {
  name: "",
  email: "",
  password: "",
  role: "cashier",
  avatar: null,
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [preview, setPreview] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    from: 0,
    to: 0,
  });

  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [pagination.currentPage, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = `/users?page=${pagination.currentPage}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (roleFilter) url += `&role=${roleFilter}`;
      const res = await api.get(url);
      const { data } = res.data;
      const usersData = data.data || data;
      setUsers(Array.isArray(usersData) ? usersData : []);
      if (data.meta) {
        setPagination({
          currentPage: data.meta.current_page,
          lastPage: data.meta.last_page,
          total: data.meta.total,
          from: data.meta.from,
          to: data.meta.to,
        });
      }
    } catch (e) {
      console.error(e);
      alert("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatar: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        avatar: null,
      });
      setPreview(user.avatar);
    } else {
      setEditingUser(null);
      setFormData(initialFormState);
      setPreview(null);
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      if (formData.password) data.append("password", formData.password);
      data.append("role", formData.role);
      if (formData.avatar) data.append("avatar", formData.avatar);

      if (editingUser) {
        data.append("_method", "PUT");
        await api.post(`/users/${editingUser.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("User updated successfully");
      } else {
        await api.post("/users", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("User created successfully");
        setSearchTerm("");
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
      }
      setModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      alert(error.response?.data?.message || "Error saving user");
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser.id) return alert("You cannot delete yourself.");
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      alert("User deleted successfully");
      fetchUsers();
    } catch (e) {
      alert("Cannot delete: " + (e.response?.data?.message || e.message));
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleClear = () => {
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  if (loading && users.length === 0) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-indigo-50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <UsersIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
                Admin Users
              </h1>
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

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <form
            onSubmit={handleSearch}
            className="sm:col-span-3 flex flex-col sm:flex-row gap-3"
          >
            <div className="flex-1">
              <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  autoComplete="off"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm font-semibold text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                {searchTerm && (
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                    <button
                      type="button"
                      onClick={handleClear}
                      className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
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
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
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

      <div className="bg-white shadow-sm overflow-hidden rounded-2xl border border-gray-200 flex flex-col">
        <div className="hidden md:block">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            <div className="col-span-4">Name & Profile</div>
            <div className="col-span-4">Email Address</div>
            <div className="col-span-2">Access Role</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
        </div>

        <ul className="divide-y divide-gray-100 flex-1">
          {users.map((user) => (
            <li key={user.id} className="px-4 py-4 sm:px-6 hover:bg-slate-50/50 transition-colors">
              <div className="md:hidden flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-10 w-10">
                      {user.avatar ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover border border-slate-100"
                          src={user.avatar}
                          alt={user.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm uppercase">
                          {user.name.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-gray-900 truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500 font-semibold truncate uppercase tracking-tighter">
                        ID: {user.id}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="text-xs font-bold text-slate-600">{user.email}</div>
                    <span
                      className={`px-2 py-0.5 inline-flex text-[10px] font-black rounded-full uppercase tracking-widest ${
                        user.role === "admin"
                          ? "bg-rose-50 text-rose-700 border border-rose-100"
                          : user.role === "manager"
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(user)}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white text-indigo-600 hover:bg-indigo-50 shadow-sm transition-all"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>
                  {user.id !== currentUser.id && (
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white text-rose-600 hover:bg-rose-50 shadow-sm transition-all"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-10 w-10">
                      {user.avatar ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover border-2 border-slate-50 shadow-sm"
                          src={user.avatar}
                          alt={user.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black uppercase shadow-sm">
                          {user.name.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-gray-900 truncate">
                        {user.name}
                      </div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Ref: {user.id}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-4 min-w-0">
                  <div className="text-sm font-bold text-slate-700 truncate">
                    {user.email}
                  </div>
                </div>
                <div className="col-span-2">
                  <span
                    className={`px-2.5 py-1 inline-flex text-[10px] font-black rounded-full uppercase tracking-widest ${
                      user.role === "admin"
                        ? "bg-rose-50 text-rose-700 border border-rose-100"
                        : user.role === "manager"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end gap-2">
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
                </div>
              </div>
            </li>
          ))}
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
          onPageChange={(page) => setPagination((prev) => ({ ...prev, currentPage: page }))}
          totalItems={pagination.total}
          fromItem={pagination.from}
          toItem={pagination.to}
        />
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setModalOpen(false)}></div>

          <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="relative w-full max-w-xl transform overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl transition-all border border-slate-100 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {editingUser ? "Edit User Record" : "Create New User"}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" strokeWidth={2.5} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center mb-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-400 group-hover:bg-white shadow-inner">
                      {preview ? (
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                        />
                      ) : (
                        <PhotoIcon className="w-10 h-10 text-slate-300 transition-colors group-hover:text-indigo-400" />
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2.5 rounded-2xl shadow-xl cursor-pointer hover:bg-slate-900 hover:scale-110 transition-all active:scale-95">
                      <PhotoIcon className="w-4 h-4" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2 px-1 text-left">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2 px-1 text-left">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="johndoe@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-2 px-1">
                        <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest">
                          Password
                        </label>
                        {editingUser && (
                          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter bg-indigo-50 px-1.5 py-0.5 rounded-md">Optional</span>
                        )}
                      </div>
                      <input
                        type="password"
                        required={!editingUser}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            password: e.target.value,
                          })
                        }
                        className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2 px-1 text-left">
                        Access Role
                      </label>
                      <div className="relative">
                        <select
                          value={formData.role}
                          onChange={(e) =>
                            setFormData({ ...formData, role: e.target.value })
                          }
                          className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                        >
                          <option value="cashier">Cashier</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Administrator</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
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
