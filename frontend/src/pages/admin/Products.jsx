import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../../services/api";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Pagination from "../../components/Pagination";

export default function Products() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialFilter = queryParams.get("filter");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [paginationData, setPaginationData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    category_id: "",
    price: "",
    cost_price: "",
    discount: "0",
    stock: "",
    low_stock_threshold: "10",
    description: "",
    is_active: true,
  });

  const [editId, setEditId] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      let url = `/products?page=${page}`;
      if (initialFilter === "low_stock") {
        url += "&low_stock=1";
      }
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      const res = await api.get(url);
      const { data } = res.data;
      const productsData = data.data || data;
      setProducts(Array.isArray(productsData) ? productsData : []);
      
      if (data.meta) {
        setPaginationData(data.meta);
        setCurrentPage(data.meta.current_page);
        setLastPage(data.meta.last_page); // Changed from setTotalPages to setLastPage to match state
      } else {
        setPaginationData({});
        setCurrentPage(1); // Reset current page if no meta data
        setLastPage(1); // Reset last page if no meta data
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories?per_page=100");
      // Categories index also uses Resource::collection()
      setCategories(res.data.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, initialFilter, searchTrigger]);

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const openModal = (product = null) => {
    if (product) {
      setEditId(product.id);
      setFormData({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode || "",
        category_id: product.category_id,
        price: product.price,
        cost_price: product.cost_price,
        discount: product.discount || "0",
        stock: product.stock,
        low_stock_threshold: product.low_stock_threshold,
        description: product.description || "",
        is_active: product.is_active,
      });
    } else {
      setEditId(null);
      setFormData({
        name: "",
        sku: "",
        barcode: "",
        category_id: categories[0]?.id || "",
        price: "",
        cost_price: "",
        discount: "0",
        stock: "",
        low_stock_threshold: "10",
        description: "",
        is_active: true,
      });
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      let value = formData[key];
      if (key === "is_active") value = value ? 1 : 0;
      data.append(key, value);
    });
    if (imageFile) data.append("image", imageFile);
    if (editId) data.append("_method", "PUT");

    try {
      if (editId) {
        await api.post(`/products/${editId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/products", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setShowModal(false);
      fetchProducts(currentPage);
    } catch (e) {
      alert(
        "Error saving product: " + (e.response?.data?.message || e.message),
      );
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts(currentPage);
    } catch (e) {
      alert(
        "Cannot delete product: " + (e.response?.data?.message || e.message),
      );
    }
  };

  if (loading && products.length === 0) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Products Catalog
        </h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="relative flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
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
                    className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Search
            </button>
          </form>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm overflow-hidden sm:rounded-xl border border-gray-200 flex flex-col">
        <ul className="divide-y divide-gray-100 flex-1">
          {products.map((product) => (
            <li key={product.id}>
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between border-gray-100">
                  <div className="flex">
                    <div className="flex-shrink-0 mr-4">
                      {product.image_url ? (
                        <img
                          className="h-12 w-12 rounded object-cover"
                          src={product.image_url}
                          alt=""
                        />
                      ) : (
                        <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500 border">
                          No Img
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-indigo-600 truncate">
                        {product.name}
                      </h3>
                      <div className="mt-1 flex gap-2 flex-col sm:flex-row text-sm text-gray-500 sm:flex-wrap">
                        <span className="flex items-center">
                          SKU: {product.sku}
                        </span>
                        <span className="hidden sm:inline">·</span>
                        <span className="flex items-center">
                          Category: {product.category?.name}
                        </span>
                        <span className="hidden sm:inline">·</span>
                        <span className="flex items-center">
                          Stock:{" "}
                          <span
                            className={`ml-1 font-semibold ${product.is_low_stock ? "text-red-500" : "text-gray-900"}`}
                          >
                            {product.stock}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex sm:mt-0 sm:ml-5 text-right font-medium text-sm flex-col">
                    <span className="text-gray-900">
                      ${parseFloat(product.discounted_price).toFixed(2)}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-gray-400 line-through text-xs">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-5 flex-shrink-0 flex space-x-2 border-transparent">
                  <button
                    onClick={() => openModal(product)}
                    className="text-indigo-600 hover:text-indigo-900 p-2"
                  >
                    <PencilIcon className="hidden h-5 w-5 sm:block" />
                    <span className="sm:hidden text-xs">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-900 p-2"
                  >
                    <TrashIcon className="hidden h-5 w-5 sm:block" />
                    <span className="sm:hidden text-xs">Delete</span>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {products.length === 0 && !loading && (
          <div className="px-6 py-12 text-center text-gray-500 bg-gray-50 flex flex-col items-center">
            <CubeIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p>No products found.</p>
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
          className="fixed z-10 inset-0 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity opacity-100"
              aria-hidden="true"
              onClick={() => setShowModal(false)}
            ></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6 opacity-100 translate-y-0 sm:scale-100">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Product Name
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
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      required
                      value={formData.category_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category_id: e.target.value,
                        })
                      }
                      className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      SKU
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Barcode
                    </label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) =>
                        setFormData({ ...formData, barcode: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Selling Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cost Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.cost_price}
                      onChange={(e) =>
                        setFormData({ ...formData, cost_price: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.low_stock_threshold}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          low_stock_threshold: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      max="100"
                      value={formData.discount}
                      onChange={(e) =>
                        setFormData({ ...formData, discount: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Product Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      rows="2"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="col-span-2 flex items-center mt-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900 border-gray-100">
                      Active status (available for sale)
                    </label>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:col-start-2 sm:text-sm border-gray-100"
                  >
                    {editId ? "Save Changes" : "Add Product"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
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
