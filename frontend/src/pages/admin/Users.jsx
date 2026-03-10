import { useState, useEffect } from "react";
import api from "../../services/api";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  UsersIcon,
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
  }, [currentPage]);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/users?page=${page}`);
      const paginator = res.data.data;
      setUsers(paginator.data ? paginator.data : paginator);
      if (paginator.current_page) {
        setCurrentPage(paginator.current_page);
        setLastPage(paginator.last_page);
        setPaginationData(paginator);
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
      alert(
        "Error saving user: " +
          (e.response?.data?.message ||
            JSON.stringify(e.response?.data?.errors) ||
            e.message),
      );
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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          User Management
        </h1>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" /> Add User
        </button>
      </div>

      <div className="bg-white shadow-sm overflow-hidden sm:rounded-xl border border-gray-200 flex flex-col">
        <ul className="divide-y divide-gray-100 flex-1">
          {users.map((user) => (
            <li
              key={user.id}
              className="px-4 py-4 flex items-center justify-between sm:px-6"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-indigo-600 truncate">
                  {user.name}
                </p>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize 
                    ${
                      user.role === "admin"
                        ? "bg-red-100 text-red-800"
                        : user.role === "manager"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.role}
                  </span>
                  <span className="ml-3 truncate">{user.email}</span>
                </div>
              </div>
              <div className="ml-5 flex-shrink-0 flex items-center space-x-2 border-transparent border-gray-100">
                <button
                  onClick={() => openModal(user)}
                  className="text-indigo-600 hover:text-indigo-900 p-2"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                {user.id !== currentUser.id && (
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-900 p-2"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        {users.length === 0 && !loading && (
          <div className="px-6 py-12 text-center text-gray-500 bg-gray-50 flex flex-col items-center">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p>No users found.</p>
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
              className="fixed inset-0 bg-gray-500 bg-opacity-75"
              onClick={() => setShowModal(false)}
            ></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 opacity-100">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                  >
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password{" "}
                    {editId && (
                      <span className="text-gray-400 font-normal">
                        (Leave blank to keep current)
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editId ? "Save" : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancel
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
