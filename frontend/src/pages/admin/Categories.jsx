import { useState, useEffect } from "react";
import api from "../../services/api";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import Pagination from "../../components/Pagination";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [paginationData, setPaginationData] = useState({});

  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage]);

  const fetchCategories = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/categories?page=${page}`);
      const { data } = res.data;
      const categoriesData = data.data || data;
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
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

  const openModal = (category = null) => {
    if (category) {
      setEditId(category.id);
      setFormData({
        name: category.name,
        description: category.description || "",
        is_active: category.is_active,
      });
    } else {
      setEditId(null);
      setFormData({ name: "", description: "", is_active: true });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/categories/${editId}`, formData);
      } else {
        await api.post("/categories", formData);
      }
      setShowModal(false);
      fetchCategories(currentPage);
    } catch (e) {
      alert(
        "Error saving category: " + (e.response?.data?.message || e.message),
      );
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories(currentPage);
    } catch (e) {
      alert("Cannot delete: " + (e.response?.data?.message || e.message));
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" /> Add Category
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0 relative mb-4">
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-5 flex-1 relative">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-900 truncate pr-6 mt-0.5">
                      {cat.name}
                    </h3>
                    <span
                      className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full uppercase tracking-wider absolute right-5 top-5 ${cat.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {cat.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                    {cat.description || "No description provided."}
                  </p>
                  <div className="flex items-center text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <CubeIcon className="w-5 h-5 mr-2 text-indigo-500" />
                    <span>Products: {cat.products_count || 0}</span>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end space-x-2">
                  <button
                    onClick={() => openModal(cat)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-semibold rounded shadow-sm text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4 mr-1.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-semibold rounded shadow-sm text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4 mr-1.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="px-6 py-12 text-center text-gray-500 bg-white shadow-sm sm:rounded-xl border border-gray-200 flex flex-col items-center">
              <CubeIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p>No categories found.</p>
            </div>
          )
        )}
      </div>

      <div className="mt-auto">
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
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity opacity-100"
              onClick={() => setShowModal(false)}
            ></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 opacity-100 translate-y-0 sm:scale-100">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Active status
                  </label>
                </div>
                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse border-gray-100">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editId ? "Save" : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
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
