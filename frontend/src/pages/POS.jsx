import { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import {
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function POS() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      // Get all active products for the POS screen
      const res = await api.get("/products?active=1&per_page=100");
      setProducts(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories?active=1&per_page=100");
      setCategories(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.includes(search) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCategory
        ? p.category_id === parseInt(selectedCategory)
        : true;
      return matchesSearch && matchesCat;
    });
  }, [products, search, selectedCategory]);

  const addToCart = (product) => {
    if (product.stock === 0) {
      alert("Product is out of stock!");
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert("Cannot add more than available stock");
          return prev;
        }
        return prev.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: parseFloat(item.price) * (item.quantity + 1),
              }
            : item,
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          price: product.discounted_price,
          discount: product.discount,
          quantity: 1,
          maxStock: product.stock,
          subtotal: parseFloat(product.discounted_price),
        },
      ];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product_id === id) {
          const newQty = item.quantity + delta;
          if (newQty < 1) return item;
          if (newQty > item.maxStock) {
            alert("Exceeded maximum stock limits");
            return item;
          }
          return {
            ...item,
            quantity: newQty,
            subtotal: parseFloat(item.price) * newQty,
          };
        }
        return item;
      }),
    );
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((i) => i.product_id !== id));

  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Cart is empty");
    if (parseFloat(amountPaid) < cartTotal)
      return alert("Amount paid is less than total");

    setIsProcessing(true);
    try {
      const payload = {
        payment_method: paymentMethod,
        amount_paid: parseFloat(amountPaid),
        items: cart.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          price: i.price,
          discount: i.discount,
        })),
      };

      const res = await api.post("/orders", payload);
      alert(
        `Order Completed successfully! Order No: ${res.data.data.order_no}`,
      );
      setCart([]);
      setShowCheckout(false);
      setAmountPaid("");
      fetchProducts(); // Refresh stock
    } catch (e) {
      alert("Checkout failed: " + (e.response?.data?.message || e.message));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6 animate-in fade-in duration-300">
      {/* Products Section */}
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search products by name, SKU or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading ? (
            <div className="text-center py-10 text-gray-500">
              Loading products...
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md hover:border-indigo-400 flex flex-col ${product.stock === 0 ? "opacity-50 ring-2 ring-red-400" : ""}`}
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 mb-3 group-hover:opacity-75 h-32 flex items-center justify-center">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">No Image</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Stock: {product.stock}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-indigo-600">
                      ${parseFloat(product.discounted_price).toFixed(2)}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-xs text-gray-400 line-through">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-10">
                  No products found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-white shadow rounded-lg flex flex-col overflow-hidden border border-gray-200">
        <div className="p-4 border-b bg-indigo-50 border-indigo-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
            <ShoppingCartIcon className="w-6 h-6" /> Current Order
          </h2>
          <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {cart.length} items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCartIcon className="w-16 h-16 mb-4 text-gray-300" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {cart.map((item) => (
                <li
                  key={item.product_id}
                  className="py-3 px-2 flex justify-between hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${parseFloat(item.price).toFixed(2)} each
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded-md">
                      <button
                        onClick={() => updateQuantity(item.product_id, -1)}
                        className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold border-r"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, 1)}
                        className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold border-l"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right w-16 text-sm font-bold text-gray-900">
                      ${item.subtotal.toFixed(2)}
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 border-gray-200">
          <div className="flex justify-between items-center mb-4 text-xl font-bold text-gray-900">
            <span>Total:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={() => setShowCheckout(true)}
            disabled={cart.length === 0}
            className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
              cart.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            Checkout
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity opacity-100"
              onClick={() => !isProcessing && setShowCheckout(false)}
            ></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full sm:p-6 opacity-100 translate-y-0 sm:scale-100">
              <form onSubmit={handleCheckout}>
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <CheckCircleIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Complete Payment
                    </h3>

                    <div className="mt-4 bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between text-lg font-bold text-gray-900 mb-4">
                        <span>Total Due:</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Payment Method
                          </label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                          >
                            <option value="cash">Cash</option>
                            <option value="card">Credit Card</option>
                            <option value="qr">QR / Mobile Wallet</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Amount Received ($)
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm border border-gray-300">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">
                                $
                              </span>
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              min={cartTotal}
                              required
                              value={amountPaid}
                              onChange={(e) => setAmountPaid(e.target.value)}
                              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 py-3 pr-12 sm:text-lg border-gray-300 rounded-md outline-none"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        {amountPaid && parseFloat(amountPaid) >= cartTotal && (
                          <div className="flex justify-between text-lg font-medium text-green-600 pt-2 border-t">
                            <span>Change Due:</span>
                            <span>
                              ${(parseFloat(amountPaid) - cartTotal).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse border-gray-100">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 border-gray-100"
                  >
                    {isProcessing ? "Processing..." : "Confirm Payment"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCheckout(false)}
                    disabled={isProcessing}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50"
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
