import { useState } from "react";
import api from "../../services/api";
import {
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  CubeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Pagination from "../../components/Pagination";
import { usePaginatedFetch } from "../../hooks/usePaginatedFetch";

const EMPTY_FORM = { name: "", description: "", is_active: true };

// ─── Helpers ─────────────────────────────────────────────────────────────────
const FieldError = ({ errors, field }) =>
  errors[field] ? (
    <p className="mt-1.5 text-xs text-red-600 font-semibold">{errors[field][0]}</p>
  ) : null;

const inputErrClass = (errors, field) =>
  errors[field]
    ? "border-red-400 bg-red-50 focus:border-red-500"
    : "border-slate-200";

export default function Categories() {
  const {
    items: categories,
    loading,
    pagination,
    setPage,
    handleClear,
    refresh,
  } = usePaginatedFetch("/categories");

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const openModal = (category = null) => {
    setFieldErrors({});
    if (category) {
      setEditId(category.id);
      setFormData({
        name: category.name,
        description: category.description || "",
        is_active: category.is_active,
      });
    } else {
      setEditId(null);
      setFormData(EMPTY_FORM);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFieldErrors({});
  };

  const validate = () => {
    const errs = {};
    const name = formData.name.trim();
    const desc = formData.description.trim();

    if (!name) {
      errs.name = ["Category name is required."];
    } else if (name.length < 2) {
      errs.name = ["Name must be at least 2 characters."];
    } else if (name.length > 100) {
      errs.name = ["Name must not exceed 100 characters."];
    }

    if (desc.length > 500) {
      errs.description = ["Description must not exceed 500 characters."];
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setSaving(true);
    setFieldErrors({});
    try {
      if (editId) {
        await api.put(`/categories/${editId}`, formData);
      } else {
        await api.post("/categories", formData);
      }
      closeModal();
      if (editId) {
        refresh();      // stay on current page when editing
      } else {
        handleClear();  // reset to page 1 so the new category is visible
      }
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        setFieldErrors(serverErrors);
      } else {
        setFieldErrors({ name: [err.response?.data?.message || "Error saving category"] });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      refresh();
    } catch (err) {
      alert("Cannot delete: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading && categories.length === 0)
    return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-indigo-50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
              <CubeIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">Categories</h1>
              <p className="text-sm text-gray-600 font-medium">
                Manage product categories and their availability.
              </p>
            </div>
          </div>

          <button
            onClick={() => openModal()}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <PlusIcon className="-ml-1 mr-1.5 h-5 w-5" />
            Add Category
          </button>
        </div>
      </div>

      {/* Category Cards */}
      <div>
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-base font-bold text-gray-900 truncate">{cat.name}</h3>
                    <span
                      className={`flex-shrink-0 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                        cat.is_active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {cat.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {cat.description || "No description provided."}
                  </p>
                  <div className="flex items-center text-sm font-semibold text-gray-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                    <CubeIcon className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0" />
                    {cat.products_count ?? 0} product{cat.products_count !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    onClick={() => openModal(cat)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                  >
                    <PencilSquareIcon className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="py-16 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center">
              <CubeIcon className="mx-auto h-16 w-16 text-gray-200 mb-4" />
              <h3 className="text-lg font-bold text-gray-700">No categories yet</h3>
              <p className="text-sm text-gray-400 mt-1">Add your first category to get started.</p>
            </div>
          )
        )}
      </div>

      <Pagination
        currentPage={pagination.currentPage}
        lastPage={pagination.lastPage}
        onPageChange={setPage}
        totalItems={pagination.total}
        fromItem={pagination.from}
        toItem={pagination.to}
      />

      {/* Modal — matches Users.jsx style */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          {/* Centered panel */}
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center">
                    <CubeIcon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {editId ? "Edit Category" : "Add New Category"}
                  </h3>
                </div>
                <button
                  onClick={closeModal}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Name */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2">
                    Category Name <span className="text-red-500 normal-case tracking-normal">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`block w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${inputErrClass(fieldErrors, "name")}`}
                    placeholder="e.g. Beverages"
                  />
                  <FieldError errors={fieldErrors} field="name" />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`block w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none ${inputErrClass(fieldErrors, "description")}`}
                    placeholder="Optional description..."
                  />
                  <FieldError errors={fieldErrors} field="description" />
                </div>

                {/* Active toggle */}
                <label className="flex items-center gap-3 cursor-pointer select-none group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${formData.is_active ? "bg-indigo-600" : "bg-slate-200"}`} />
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${formData.is_active ? "translate-x-5" : ""}`} />
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    {formData.is_active ? "Active — visible for sale" : "Inactive — hidden from POS"}
                  </span>
                </label>

                {/* Footer buttons */}
                <div className="pt-6 border-t border-slate-100 flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-4 border-2 border-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 hover:text-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-200 hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving…" : editId ? "Save Changes" : "Add Category"}
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
