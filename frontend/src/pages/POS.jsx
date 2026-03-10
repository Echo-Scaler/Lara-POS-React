import { useState, useEffect, useMemo, useCallback } from "react";
import api from "../services/api";
import {
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  CheckCircleIcon,
  PauseIcon,
  PlayIcon,
  PrinterIcon,
  PlusIcon,
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

  // Advanced features state
  const [hasHeldOrder, setHasHeldOrder] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // Check if there's a held order on mount
    setHasHeldOrder(!!localStorage.getItem("held_order"));
  }, []);

  const fetchProducts = async () => {
    try {
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

  const addToCart = useCallback((product) => {
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
  }, []);

  // Barcode Scanner Listener
  useEffect(() => {
    let buffer = "";
    let timeout;
    const handleKeyDown = (e) => {
      // Ignore if user is manually typing in an input
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.tagName === "SELECT"
      )
        return;

      if (e.key === "Enter" && buffer.length > 0) {
        // Match barcode or sku
        const product = products.find(
          (p) => p.barcode === buffer || p.sku === buffer,
        );
        if (product) {
          addToCart(product);
        } else {
          console.log("No product found for barcode:", buffer);
        }
        buffer = "";
        clearTimeout(timeout);
      } else if (e.key.length === 1) {
        buffer += e.key;
        clearTimeout(timeout);
        // Clear buffer if it's just normal typing (scanners are very fast)
        timeout = setTimeout(() => {
          buffer = "";
        }, 50);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timeout);
    };
  }, [products, addToCart]);

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

  // Hold / Resume Order Handlers
  const holdOrder = () => {
    if (cart.length === 0) return;
    localStorage.setItem("held_order", JSON.stringify(cart));
    setCart([]);
    setHasHeldOrder(true);
  };

  const resumeOrder = () => {
    const saved = localStorage.getItem("held_order");
    if (saved) {
      setCart(JSON.parse(saved));
      localStorage.removeItem("held_order");
      setHasHeldOrder(false);
    }
  };

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
      // Show Receipt Modal
      setCompletedOrder({
        ...res.data.data,
        cartSnapshot: cart,
        amount_paid: parseFloat(amountPaid),
        change: parseFloat(amountPaid) - cartTotal,
      });
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

  // Quick select exact cash amounts
  const fastCashAmounts = useMemo(() => {
    if (cartTotal === 0) return [];

    const amounts = new Set();
    const ceilTen = Math.ceil(cartTotal / 10) * 10;

    // Add exact amount
    amounts.add(cartTotal);
    // Add next nearest bills
    [10, 20, 50, 100].forEach((bill) => {
      if (bill > cartTotal) amounts.add(bill);
    });
    // Add rounded up to nearest 10
    if (ceilTen > cartTotal) amounts.add(ceilTen);

    return Array.from(amounts)
      .sort((a, b) => a - b)
      .slice(0, 4);
  }, [cartTotal]);

  const printReceipt = () => {
    window.print();
  };

  return (
    <>
      {/* Main POS Layout */}
      <div className="flex h-[calc(100vh-6rem)] gap-6 animate-in fade-in duration-300 print:hidden">
        {/* Products Section */}
        <div className="flex-1 flex flex-col min-w-0 bg-white shadow rounded-xl overflow-hidden border border-gray-200">
          <div className="p-4 border-b flex flex-col sm:flex-row gap-4 bg-gray-50/50">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm transition-shadow"
                placeholder="Search products by name, SKU or scan barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm bg-white"
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

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
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
                    className={`relative group bg-white rounded-2xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)] border border-gray-100 p-3 pb-4 cursor-pointer transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] hover:-translate-y-1 overflow-hidden flex flex-col ${product.stock === 0 ? "opacity-50 grayscale select-none" : "hover:border-indigo-300"}`}
                  >
                    {/* Hover Add Overlay for intuitive interaction */}
                    {product.stock > 0 && (
                      <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors duration-300 z-10 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-indigo-600 text-white p-3 rounded-full shadow-lg transform scale-50 group-hover:scale-100 transition-transform duration-300 ease-out">
                          <PlusIcon className="w-6 h-6" />
                        </div>
                      </div>
                    )}

                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-xl bg-gray-50 mb-4 h-36 flex items-center justify-center relative border border-gray-100/50">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm font-medium tracking-wide">
                          No Image
                        </span>
                      )}

                      {/* Dynamic Stock Badge */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                        {product.stock === 0 ? (
                          <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded shadow-sm">
                            Out of Stock
                          </span>
                        ) : product.stock <= 5 ? (
                          <span className="bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded shadow-sm animate-pulse">
                            Low: {product.stock}
                          </span>
                        ) : (
                          <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            {product.stock} in stock
                          </span>
                        )}

                        {product.discount > 0 && (
                          <span className="bg-rose-500/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded shadow-sm">
                            {product.discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 px-1 flex flex-col justify-between relative z-20">
                      <div>
                        <h3 className="text-[13px] sm:text-sm font-bold text-gray-800 leading-snug line-clamp-2 min-h-[40px]">
                          {product.name}
                        </h3>
                      </div>
                      <div className="mt-3 flex items-end justify-between items-center bg-gray-50/50 p-2 rounded-lg border border-gray-50">
                        <div className="flex flex-col">
                          {product.discount > 0 && (
                            <span className="text-[10px] text-gray-400 font-bold line-through ml-0.5">
                              ${parseFloat(product.price).toFixed(2)}
                            </span>
                          )}
                          <span className="text-base sm:text-lg font-black tracking-tight text-indigo-600 leading-none">
                            ${parseFloat(product.discounted_price).toFixed(2)}
                          </span>
                        </div>
                        {product.category && (
                          <span className="text-[10px] uppercase font-bold text-gray-400 truncate max-w-[80px]">
                            {product.category.name}
                          </span>
                        )}
                      </div>
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
        <div className="w-96 bg-white shadow rounded-xl flex flex-col overflow-hidden border border-gray-200">
          <div className="p-4 border-b bg-indigo-50/50 border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCartIcon className="w-6 h-6 text-indigo-600" /> Current
                Order
              </h2>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-full border border-indigo-200">
                {cart.length} items
              </span>
            </div>

            {/* Hold/Resume Actions */}
            <div className="flex gap-2">
              <button
                onClick={holdOrder}
                disabled={cart.length === 0}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-semibold rounded-md border transition-colors ${
                  cart.length === 0
                    ? "border-gray-200 text-gray-400 bg-gray-50"
                    : "border-yellow-200 text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                }`}
              >
                <PauseIcon className="w-4 h-4" /> Hold
              </button>
              <button
                onClick={resumeOrder}
                disabled={!hasHeldOrder}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-semibold rounded-md border transition-colors ${
                  !hasHeldOrder
                    ? "border-gray-200 text-gray-400 bg-gray-50"
                    : "border-green-200 text-green-700 bg-green-50 hover:bg-green-100"
                }`}
              >
                <PlayIcon className="w-4 h-4" /> Resume
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 bg-gray-50/30">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <ShoppingCartIcon className="w-16 h-16 mb-4 text-gray-200" />
                <p className="font-medium text-gray-500">Scan or add items</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 space-y-1">
                {cart.map((item) => (
                  <li
                    key={item.product_id}
                    className="py-3 px-3 flex justify-between bg-white hover:bg-gray-50 rounded-lg shadow-sm border border-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        ${parseFloat(item.price).toFixed(2)} each
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-sm font-bold text-indigo-600">
                        ${item.subtotal.toFixed(2)}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-gray-200 rounded-md bg-white shadow-sm overflow-hidden h-7">
                          <button
                            onClick={() => updateQuantity(item.product_id, -1)}
                            className="w-7 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600 font-bold border-r border-gray-200 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 h-full flex items-center justify-center text-sm font-bold text-gray-700">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, 1)}
                            className="w-7 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600 font-bold border-l border-gray-200 transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-4 border-t bg-white border-gray-200 shadow-sm z-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 font-medium">Total Balance</span>
              <span className="text-2xl font-black text-gray-900">
                ${cartTotal.toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              disabled={cart.length === 0}
              className={`w-full py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white transition-all transform active:scale-[0.98] ${
                cart.length === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-md"
              }`}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>

      {/* Modern Checkout Modal */}
      {showCheckout && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto print:hidden"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity"
              onClick={() => !isProcessing && setShowCheckout(false)}
            ></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full opacity-100 translate-y-0 sm:scale-100 border border-white/20">
              {/* Header */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 px-6 py-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm shadow-inner rounded-full flex items-center justify-center mb-4 border border-white/30">
                    <ShoppingCartIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    Complete Payment
                  </h3>
                  <p className="text-gray-300 mt-1 font-medium text-sm text-balance">
                    Review order details and select payment method below.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCheckout}>
                <div className="px-6 py-6 pb-2">
                  {/* Total Amount Badge */}
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-6 flex items-center justify-between shadow-sm">
                    <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">
                      Total Due
                    </span>
                    <span className="text-4xl font-black text-gray-900 tracking-tighter">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-6">
                    {/* Payment Method Selector */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Select Method
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {["cash", "card", "qr"].map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            className={`py-3 px-2 rounded-xl border-2 transition-all font-bold text-sm tracking-wide capitalize flex flex-col items-center justify-center gap-1 ${paymentMethod === method ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm transform scale-[1.02]" : "border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50"}`}
                          >
                            {method === "cash"
                              ? "💵 Cash"
                              : method === "card"
                                ? "💳 Card"
                                : "📱 QR Code"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Amount Received Input */}
                    <div className="bg-white">
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex justify-between">
                        <span>Amount Received</span>
                      </label>

                      {/* Fast Cash Buttons */}
                      <div
                        className={`transition-all overflow-hidden ${paymentMethod === "cash" ? "max-h-20 mb-3 opacity-100" : "max-h-0 opacity-0 m-0"}`}
                      >
                        <div className="flex flex-wrap gap-2">
                          {fastCashAmounts.map((amount) => (
                            <button
                              key={amount}
                              type="button"
                              onClick={() => setAmountPaid(amount.toString())}
                              className="flex-1 min-w-[70px] py-2 px-3 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 shadow-sm text-sm font-black rounded-xl border border-indigo-100 transition-all active:scale-95"
                            >
                              ${amount.toFixed(2).replace(/\.00$/, "")}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="relative rounded-xl shadow-inner border-2 border-gray-100 bg-gray-50 focus-within:border-indigo-500 focus-within:bg-white transition-colors overflow-hidden flex items-center mt-1">
                        <div className="pl-5 pr-2 pointer-events-none">
                          <span className="text-gray-400 font-bold text-2xl">
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
                          className="w-full py-4 pr-5 bg-transparent border-none outline-none text-right font-black text-3xl text-gray-900 focus:ring-0 placeholder-gray-300"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Change Due Display */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${amountPaid && parseFloat(amountPaid) >= cartTotal ? "max-h-20 opacity-100 translate-y-0" : "max-h-0 opacity-0 translate-y-4"}`}
                    >
                      <div className="flex justify-between items-center bg-green-50 border border-green-200 p-4 rounded-xl shadow-sm">
                        <span className="text-green-800 font-bold text-sm tracking-wide">
                          CHANGE DUE
                        </span>
                        <span className="text-green-700 font-black text-2xl">
                          $
                          {amountPaid
                            ? (parseFloat(amountPaid) - cartTotal).toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-6 pb-8 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)] text-lg font-black text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all active:scale-[0.98] transform"
                  >
                    {isProcessing ? "Processing..." : "Confirm Payment"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCheckout(false)}
                    disabled={isProcessing}
                    className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors disabled:opacity-50"
                  >
                    Cancel Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal & Print Area */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Modal Background for screen viewing, hidden on print */}
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity print:hidden"></div>

          <div className="flex items-center justify-center min-h-screen p-4 text-center">
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen print:hidden">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:align-middle sm:max-w-sm w-full print:shadow-none print:max-w-full print:overflow-visible print:border-none print:w-[300px] print:m-0 print:p-0">
              {/* Receipt Content */}
              <div className="p-6 print:p-0">
                <div className="text-center mb-6">
                  <div className="mx-auto h-12 w-12 bg-gray-900 rounded-full flex items-center justify-center mb-3 print:hidden">
                    <span className="text-white font-bold text-xl">POS</span>
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 print:text-xl">
                    Supermarket POS
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    123 Store Address, City
                  </p>
                  <p className="text-sm text-gray-500">Tel: (555) 123-4567</p>
                </div>

                <div className="border-t border-b border-dashed border-gray-300 py-3 mb-4 space-y-1 text-sm font-medium">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Order No:</span>
                    <span className="text-gray-900">
                      {completedOrder.order_no}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="text-gray-900">
                      {new Date(
                        completedOrder.created_at || Date.now(),
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-dashed border-gray-300">
                        <th className="text-left font-semibold text-gray-600 pb-2">
                          Item
                        </th>
                        <th className="text-right font-semibold text-gray-600 pb-2">
                          Qty
                        </th>
                        <th className="text-right font-semibold text-gray-600 pb-2">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dashed divide-gray-100">
                      {(completedOrder.cartSnapshot || []).map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 text-gray-900 font-medium">
                            <div className="truncate max-w-[150px]">
                              {item.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              @ ${parseFloat(item.price).toFixed(2)}
                            </div>
                          </td>
                          <td className="py-2 text-right text-gray-900 font-medium">
                            {item.quantity}
                          </td>
                          <td className="py-2 text-right text-gray-900 font-bold">
                            ${item.subtotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-dashed border-gray-300 pt-3 space-y-2">
                  <div className="flex justify-between text-base font-bold text-gray-900">
                    <span>Total Due</span>
                    <span>
                      $
                      {parseFloat(
                        completedOrder.total ||
                          completedOrder.cartSnapshot.reduce(
                            (s, i) => s + i.subtotal,
                            0,
                          ),
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-gray-600">
                    <span>Cash Tendered</span>
                    <span>${completedOrder.amount_paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-900">
                    <span>Change</span>
                    <span>${completedOrder.change.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-8 text-center text-sm font-medium text-gray-500">
                  <p>Thank you for your purchase!</p>
                  <p className="mt-1">Please come again.</p>
                </div>
              </div>

              {/* Action Buttons - Hidden on print */}
              <div className="bg-gray-50 px-6 py-4 flex flex-col gap-3 rounded-b-xl border-t border-gray-100 print:hidden">
                <button
                  type="button"
                  onClick={printReceipt}
                  className="w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-bold text-white hover:bg-indigo-700 transition-colors gap-2"
                >
                  <PrinterIcon className="w-5 h-5" /> Print Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setCompletedOrder(null)}
                  className="w-full inline-flex justify-center items-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close & Next Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
