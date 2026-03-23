import { useState } from "react";
import api from "../services/api";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Pagination from "../components/Pagination";
import { usePaginatedFetch } from "../hooks/usePaginatedFetch";

const EMPTY_FORM = { name: "", email: "", phone: "", address: "" };

// Inline field-level error component
const FieldError = ({ errors, field }) =>
  errors[field] ? (
    <p className="mt-1 text-xs text-red-600 font-medium">{errors[field][0]}</p>
  ) : null;

export default function Customers() {
  const {
    items: customers,
    loading,
    pagination,
    setPage,
    handleClear,
    refresh,
  } = usePaginatedFetch("/customers");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const openModal = (customer = null) => {
    setFieldErrors({});
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
      setFormData(EMPTY_FORM);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFieldErrors({});
  };

  const field = (key) => ({
    value: formData[key],
    onChange: (e) => {
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));
      // Clear per-field error on change
      if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
  });

  const buildPayload = () => {
    // Strip empty optional fields so unique rules aren't applied to blank strings
    const payload = { name: formData.name };
    if (formData.email.trim()) payload.email = formData.email.trim();
    if (formData.phone.trim()) payload.phone = formData.phone.trim();
    if (formData.address.trim()) payload.address = formData.address.trim();
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});
    try {
      const payload = buildPayload();
      if (editId) {
        await api.put(`/customers/${editId}`, payload);
      } else {
        await api.post("/customers", payload);
      }
      closeModal();
      if (editId) {
        refresh();      // stay on current page when editing
      } else {
        handleClear();  // reset search + go to page 1 so the new customer is visible
      }
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      if (validationErrors) {
        setFieldErrors(validationErrors);
      } else {
        setFieldErrors({ name: [err.response?.data?.message || "An error occurred"] });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await api.delete(`/customers/${id}`);
      refresh();
    } catch (err) {
      alert("Cannot delete: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading && customers.length === 0)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-indigo-50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
              <UserGroupIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">Customers</h1>
              <p className="text-sm text-gray-500 font-medium mt-0.5">
                Manage your customer database and contact information.
              </p>
            </div>
          </div>

          <button
            onClick={() => openModal()}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <PlusIcon className="-ml-1 mr-1.5 h-5 w-5" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Customer", "Contact Info", "Address", "Actions"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className={`px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider ${
                      h === "Actions" ? "text-right" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-700 font-bold text-sm">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{customer.name}</div>
                        <div className="text-xs text-gray-400">ID #{customer.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.email || <span className="text-gray-400 italic">No email</span>}</div>
                    <div className="text-sm text-gray-500">{customer.phone || <span className="text-gray-400 italic">No phone</span>}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                      {customer.address || <span className="text-gray-400 italic">No address</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openModal(customer)}
                        title="Edit"
                        className="text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 p-2 rounded-lg transition-all"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        title="Delete"
                        className="text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 p-2 rounded-lg transition-all"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {customers.length === 0 && !loading && (
          <div className="px-6 py-12 text-center text-gray-400 bg-gray-50 flex flex-col items-center">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="font-medium">No customers found.</p>
            <p className="text-sm mt-1">Add your first customer to get started.</p>
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

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="customer-modal-title">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
              onClick={closeModal}
            />

            {/* Modal panel */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 z-10">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                    <UserGroupIcon className="h-5 w-5 text-white" />
                  </div>
                  <h2 id="customer-modal-title" className="text-lg font-bold text-gray-900">
                    {editId ? "Edit Customer" : "Add New Customer"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleSubmit} noValidate>
                <div className="px-6 py-5 space-y-4">

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jane Doe"
                      {...field("name")}
                      className={`block w-full border rounded-xl shadow-sm py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                        fieldErrors.name ? "border-red-400 bg-red-50" : "border-gray-300"
                      }`}
                    />
                    <FieldError errors={fieldErrors} field="name" />
                  </div>

                  {/* Email + Phone side by side */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="jane@example.com"
                        {...field("email")}
                        className={`block w-full border rounded-xl shadow-sm py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                          fieldErrors.email ? "border-red-400 bg-red-50" : "border-gray-300"
                        }`}
                      />
                      <FieldError errors={fieldErrors} field="email" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                      <input
                        type="text"
                        placeholder="+1 555 0100"
                        {...field("phone")}
                        className={`block w-full border rounded-xl shadow-sm py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                          fieldErrors.phone ? "border-red-400 bg-red-50" : "border-gray-300"
                        }`}
                      />
                      <FieldError errors={fieldErrors} field="phone" />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                    <textarea
                      rows={2}
                      placeholder="Street address, city, country..."
                      {...field("address")}
                      className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-colors"
                    />
                    <FieldError errors={fieldErrors} field="address" />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex flex-row-reverse gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-transparent text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Saving...
                      </>
                    ) : editId ? "Save Changes" : "Create Customer"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
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
