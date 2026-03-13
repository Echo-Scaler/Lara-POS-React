import { useState, useEffect } from "react";
import api from "../services/api";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import Pagination from "../components/Pagination";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [paginationData, setPaginationData] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchCustomers(currentPage);
  }, [currentPage]);

  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/customers?page=${page}`);
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

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Customer Management
        </h1>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" /> Add Customer
        </button>
      </div>

      <div className="bg-white shadow-sm overflow-hidden sm:rounded-xl border border-gray-200 flex flex-col">
        <ul className="divide-y divide-gray-100 flex-1">
          {customers.map((customer) => (
            <li
              key={customer.id}
              className="px-4 py-4 flex items-center justify-between sm:px-6"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-indigo-600 truncate">
                  {customer.name}
                </p>
                <div className="mt-1 flex flex-col sm:flex-row sm:gap-4 text-sm text-gray-500">
                  <span className="truncate">
                    {customer.email || "No email"}
                  </span>
                  <span className="truncate">
                    {customer.phone || "No phone"}
                  </span>
                </div>
              </div>
              <div className="ml-5 flex-shrink-0 flex items-center space-x-2">
                <button
                  onClick={() => openModal(customer)}
                  className="text-indigo-600 hover:text-indigo-900 p-2"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(customer.id)}
                  className="text-red-600 hover:text-red-900 p-2"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
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
            <div className="inline-block align-bottom bg-gray-100 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 opacity-100 translate-y-0 sm:scale-100">
              <form
                id="customer-form"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <h3
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  id="modal-title"
                >
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
                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                  <button
                    id="customer-submit-button"
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
