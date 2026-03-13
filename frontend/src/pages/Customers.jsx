import { useState, useEffect } from "react";
import api from "../services/api";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Pagination from "../components/Pagination";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [paginationData, setPaginationData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchCustomers(currentPage);
  }, [currentPage, searchTrigger]);

  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    try {
      let url = `/customers?page=${page}`;
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      const res = await api.get(url);
      const responseData = res.data.data; // This is the ResourceCollection wrapped in successResponse
      
      if (responseData.data) {
        setCustomers(responseData.data);
        if (responseData.meta) {
          setPaginationData(responseData.meta);
          setCurrentPage(responseData.meta.current_page);
          setLastPage(responseData.meta.last_page);
        }
      } else {
        setCustomers(Array.isArray(responseData) ? responseData : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (customer = null) => {
    if (customer) {
      setEditId(customer.id);
      setFormData({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
      });
    } else {
      setEditId(null);
      setFormData({ name: "", email: "", phone: "", address: "" });
    }
    setShowModal(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchTrigger((prev) => prev + 1);
  };

  const handleClear = () => {
    setSearchTerm("");
    setCurrentPage(1);
    setSearchTrigger((prev) => prev + 1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    console.log("Submitting customer form...", { editId, formData });
    try {
      let response;
      if (editId) {
        response = await api.put(`/customers/${editId}`, formData);
      } else {
        response = await api.post("/customers", formData);
      }
      console.log("Customer saved successfully:", response.data);
      setShowModal(false);
      fetchCustomers(currentPage);
    } catch (e) {
      console.error("Customer submission error details:", e);
      const errorMessage = e.response?.data?.message || e.message;
      alert("Error saving customer:\n" + errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers(currentPage);
    } catch (e) {
      alert("Cannot delete: " + (e.response?.data?.message || e.message));
    }
  };

  if (loading && customers.length === 0)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your customer database and viewing their contact information.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <form
            onSubmit={handleSearch}
            className="relative flex items-center gap-3"
          >
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              {searchTerm && (
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                  >
                    <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Search
            </button>
          </form>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" /> Add Customer
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Customer Name
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Contact Info
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Address
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-700 font-bold text-lg">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {customer.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: #{customer.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.email || "No email"}</div>
                    <div className="text-sm text-gray-500">{customer.phone || "No phone"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                      {customer.address || "No address provided"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => openModal(customer)}
                        className="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {customers.length === 0 && !loading && (
          <div className="px-6 py-12 text-center text-gray-500 bg-gray-50 flex flex-col items-center">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p>No customers found.</p>
          </div>
        )}
        <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          onPageChange={setCurrentPage}
          totalItems={paginationData.total || 0}
          fromItem={paginationData.from || 0}
          toItem={paginationData.to || 0}
        />
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-10 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-blue-100 bg-opacity-75 transition-opacity opacity-100"
              aria-hidden="true"
              onClick={() => setShowModal(false)}
            ></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-8 opacity-100 translate-y-0 sm:scale-100 border border-gray-100">
              <form
                id="customer-form"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <h3
                  className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"
                  id="modal-title"
                >
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <UserGroupIcon className="h-6 w-6" />
                  </div>
                  {editId ? "Edit Customer" : "Add New Customer"}
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    id="customer-name-input"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    rows="2"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                  <div className="mt-8 sm:flex sm:flex-row-reverse gap-3">
                    <button
                      id="customer-submit-button"
                      type="submit"
                      className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-2.5 bg-indigo-600 text-base font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm transition-all shadow-indigo-200"
                    >
                      {editId ? "Save Changes" : "Create Customer"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-6 py-2.5 bg-white text-base font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 sm:mt-0 sm:w-auto sm:text-sm transition-all"
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
