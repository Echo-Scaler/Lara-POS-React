import { useState, useEffect } from "react";
import api from "../../services/api";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import Pagination from "../../components/Pagination";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [paginationData, setPaginationData] = useState({});
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "cashier",
  });
  const [editId, setEditId] = useState(null);

  const { user: currentUser } = useAuth(); // to prevent self-deletion

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, searchTrigger, roleFilter]);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      let url = `/users?page=${page}`;
      if (query) url += `&search=${encodeURIComponent(query)}`;
      if (roleFilter) url += `&role=${roleFilter}`;
      const res = await api.get(url);
      const { data } = res.data; // This is the ResourceCollection
      const usersData = data.data || data;
      setUsers(Array.isArray(usersData) ? usersData : []);
      if (data.meta) {
        setCurrentPage(data.meta.current_page);
        setLastPage(data.meta.last_page);
        setPaginationData(data.meta);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user = null) => {
    if (user) {
      setEditId(user.id);
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
      });
    } else {
      setEditId(null);
      setFormData({ name: "", email: "", password: "", role: "cashier" });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };

      // If editing and password is empty, completely remove it from the payload
      if (editId && (!payload.password || payload.password.trim() === "")) {
        delete payload.password;
      }

      if (editId) {
        await api.put(`/users/${editId}`, payload);
      } else {
        await api.post("/users", payload);
      }
      setShowModal(false);
      fetchUsers(currentPage);
    } catch (e) {
      console.error("User submission error:", e.response?.data || e);
      let errorMsg = e.response?.data?.message || e.message;
      if (e.response?.data?.errors) {
        const errors = e.response.data.errors;
        errorMsg += "\n" + Object.values(errors).flat().join("\n");
      }
      alert("Error saving user:\n" + errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser.id) return alert("You cannot delete yourself.");
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers(currentPage);
    } catch (e) {
      alert("Cannot delete: " + (e.response?.data?.message || e.message));
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    setSearchTrigger((prev) => prev + 1);
  };

  const handleClear = () => {
    setQuery("");
    setCurrentPage(1);
    setSearchTrigger((prev) => prev + 1);
  };

  if (loading && users.length === 0) return <div className="p-4 text-center">Loading...</div>;

  // Removed local filtering

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
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
          >
            <PlusIcon className="h-5 w-5" /> Add User
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
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm font-semibold text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                {query && (
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
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
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
            <div className="col-span-4">Name</div>
            <div className="col-span-5">Email</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-1 text-right">Action</div>
          </div>
        </div>

        <ul className="divide-y divide-gray-100 flex-1">
          {users.map((user) => (
            <li key={user.id} className="px-4 py-4 sm:px-6">
              <div className="md:hidden flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center font-black text-sm">
                      {(user.name || "U").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-gray-900 truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500 font-semibold truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span
                      className={`px-2.5 py-1 inline-flex text-[11px] font-extrabold rounded-full capitalize ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : user.role === "manager"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-slate-100 text-slate-800 border border-slate-200"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(user)}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white text-indigo-600 hover:bg-indigo-50"
                    title="Edit"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  {user.id !== currentUser.id && (
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-black">
                      {(user.name || "U").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-gray-900 truncate">
                        {user.name}
                      </div>
                      <div className="text-xs font-semibold text-gray-500 truncate">
                        ID: {user.id}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-5 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {user.email}
                  </div>
                </div>
                <div className="col-span-2">
                  <span
                    className={`px-2.5 py-1 inline-flex text-[11px] font-extrabold rounded-full capitalize ${
                      user.role === "admin"
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : user.role === "manager"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-slate-100 text-slate-800 border border-slate-200"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end gap-2">
                  <button
                    onClick={() => openModal(user)}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white text-indigo-600 hover:bg-indigo-50"
                    title="Edit"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  {user.id !== currentUser.id && (
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
        {users.length === 0 && !loading && (
          <div className="px-6 py-12 text-center text-gray-500 bg-gray-50 flex flex-col items-center">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="font-semibold">No users found.</p>
          </div>
        )}
        <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          onPageChange={setCurrentPage}
          totalItems={paginationData.total}
          fromItem={paginationData.from}
          toItem={paginationData.to}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            ></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)] transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full opacity-100 border border-white/30">
              <div className="px-6 py-5 bg-gradient-to-br from-indigo-700 via-slate-800 to-gray-900">
                <div className="text-white">
                  <div className="text-lg font-extrabold">
                    {editId ? "Edit User" : "Add User"}
                  </div>
                  <div className="text-sm font-semibold text-white/80 mt-0.5">
                    {editId
                      ? "Update user details and permissions."
                      : "Create a new user account."}
                  </div>
                </div>
              </div>
              <form
                onSubmit={handleSubmit}
                className="px-6 py-6 space-y-4 bg-gradient-to-b from-slate-50 to-white"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                      Role
                    </label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    >
                      <option value="cashier">Cashier</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                      Password{" "}
                      {editId && (
                        <span className="text-slate-400 font-bold normal-case tracking-normal">
                          (Leave blank to keep current)
                        </span>
                      )}
                    </label>
                    <input
                      type="password"
                      required={!editId}
                      minLength="6"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="inline-flex justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-xl border border-transparent bg-indigo-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-indigo-700 shadow-sm"
                  >
                    {editId ? "Save" : "Add"}
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
