import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";
import {
  EyeIcon,
  XCircleIcon,
  ClipboardDocumentListIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import Pagination from "../components/Pagination";

export default function Orders() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialDate = queryParams.get("date") || "";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [paginationData, setPaginationData] = useState({});
  const [filterDate, setFilterDate] = useState(initialDate);
  const [filterTime, setFilterTime] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(0);

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  useEffect(() => {
    setFilterDate(initialDate);
    setCurrentPage(1);
    setSearchTrigger((prev) => prev + 1);
  }, [initialDate]);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, searchTrigger]);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      let url = `/orders?page=${page}`;
      if (filterDate) url += `&date=${filterDate}`;
      if (filterTime) url += `&time=${filterTime}`;

      const res = await api.get(url);
      const { data } = res.data;
      setOrders(data.data || data || []);
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

  const handleCancelOrder = async (id) => {
    if (
      !confirm(
        "Are you sure you want to cancel this order? This will restore stock.",
      )
    )
      return;
    try {
      await api.post(`/orders/${id}/cancel`);
      alert("Order cancelled successfully");
      fetchOrders(currentPage);
      setSelectedOrder(null);
    } catch (e) {
      alert("Failed to cancel: " + (e.response?.data?.message || e.message));
    }
  };

  const viewOrder = async (id) => {
    try {
      const res = await api.get(`/orders/${id}`);
      setSelectedOrder(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");

  const handleDownloadCsv = async (orderId, orderNo) => {
    try {
      const response = await api.get(`/orders/${orderId}/csv`, {
        responseType: "blob", // Important for file downloads
      });

      // Create a URL for the blob
      const contentType =
        response.headers["content-type"] || "text/csv;charset=utf-8";
      downloadBlob(
        new Blob([response.data], { type: contentType }),
        `order-${orderNo}.csv`,
      );
    } catch (error) {
      console.error("Error downloading CSV:", error);
      alert("Failed to download CSV.");
    }
  };

  const buildReceiptHtml = (order) => {
    const itemsHtml = (order.items || [])
      .map((item) => {
        const qty = item.quantity ?? 0;
        const name = item.product_name ?? "";
        const price = item.price ?? 0;
        const subtotal = item.subtotal ?? qty * price;
        return `
            <tr>
              <td style="padding: 6px 0;">
                <div style="font-weight: 600; color: #111827;">${escapeHtml(name)}</div>
                <div style="font-size: 12px; color: #6b7280;">@ $${Number(price).toFixed(2)}</div>
              </td>
              <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #111827;">${qty}</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #111827;">$${Number(subtotal).toFixed(2)}</td>
            </tr>
          `;
      })
      .join("");

    const subtotalAmount = Number(order.subtotal ?? 0);
    const discountAmount = Number(order.discount_amount ?? 0);
    let taxAmount = Number(order.tax);
    if (!Number.isFinite(taxAmount)) {
      taxAmount = Math.round(subtotalAmount * 0.08 * 100) / 100;
    }
    const totalAmount = Number(order.total ?? subtotalAmount + taxAmount - discountAmount);

    const subtotal = subtotalAmount.toFixed(2);
    const discount = discountAmount.toFixed(2);
    const tax = taxAmount.toFixed(2);
    const total = totalAmount.toFixed(2);
    const orderNo = String(order.order_no ?? "");
    const createdAt = order.created_at
      ? new Date(order.created_at).toLocaleString()
      : "";

    return `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Receipt ${escapeHtml(orderNo)}</title>
          </head>
          <body style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 0; padding: 16px; background: #ffffff;">
            <div style="width: 300px; margin: 0 auto;">
              <div style="text-align: center; margin-bottom: 12px;">
                <div style="width: 48px; height: 48px; background: #111827; border-radius: 999px; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: #ffffff; font-weight: 800;">POS</span>
                </div>
                <div style="font-size: 18px; font-weight: 800; color: #111827;">Supermarket POS</div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Order No: ${escapeHtml(orderNo)}</div>
                <div style="font-size: 12px; color: #6b7280;">${escapeHtml(createdAt)}</div>
              </div>

              <div style="border-top: 1px dashed #d1d5db; border-bottom: 1px dashed #d1d5db; padding: 10px 0; margin-bottom: 10px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <thead>
                    <tr>
                      <th style="text-align: left; padding-bottom: 6px; color: #4b5563; font-weight: 700;">Item</th>
                      <th style="text-align: right; padding-bottom: 6px; color: #4b5563; font-weight: 700;">Qty</th>
                      <th style="text-align: right; padding-bottom: 6px; color: #4b5563; font-weight: 700;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
              </div>

              <div style="border-top: 1px dashed #d1d5db; padding-top: 10px; margin-top: 6px;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: #4b5563;">
                  <div>Subtotal</div>
                  <div>$${subtotal}</div>
                </div>
                ${discountAmount > 0 ? `
                  <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: #4b5563; margin-top: 4px;">
                    <div>Discount</div>
                    <div>-$${discount}</div>
                  </div>
                ` : ""}
                <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: #4b5563; margin-top: 4px;">
                  <div>Tax (8%)</div>
                  <div>$${tax}</div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 900; color: #111827; margin-top: 8px;">
                  <div>Total</div>
                  <div>$${total}</div>
                </div>
              </div>

              <div style="text-align: center; margin-top: 14px; font-size: 12px; color: #6b7280; font-weight: 600;">
                Thank you for your purchase!
              </div>
            </div>
          </body>
        </html>
      `;
  };

  const handleDownloadReceipt = async (orderId, orderNo) => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      const receiptHtml = buildReceiptHtml(res.data.data);
      downloadBlob(
        new Blob([receiptHtml], { type: "text/html;charset=utf-8" }),
        `order-${orderNo}-receipt.html`,
      );
    } catch (e) {
      console.error(e);
      alert("Failed to download receipt.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Order History</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Time (After)
            </label>
            <input
              type="time"
              value={filterTime}
              onChange={(e) => setFilterTime(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div className="flex items-end gap-2">
            <button
              onClick={() => {
                setCurrentPage(1);
                setSearchTrigger((prev) => prev + 1);
              }}
              className="py-1.5 px-4 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Search
            </button>
            {(filterDate || filterTime) && (
              <button
                onClick={() => {
                  setFilterDate("");
                  setFilterTime("");
                  setCurrentPage(1);
                  setSearchTrigger((prev) => prev + 1);
                }}
                className="py-1.5 px-3 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm overflow-hidden sm:rounded-xl border border-gray-200 flex flex-col">
        <ul className="divide-y divide-gray-100 flex-1">
          {orders.map((order) => (
            <li key={order.id}>
              <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-indigo-600 truncate">
                    Order: {order.order_no}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatDateTime(order.created_at)} · Cashier:{" "}
                    {order.user.name}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4 flex items-center gap-4">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === "completed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {order.status}
                  </span>
                  <span className="text-base font-bold text-gray-900">
                    ${parseFloat(order.total).toFixed(2)}
                  </span>
                  <button
                    onClick={() => viewOrder(order.id)}
                    className="text-gray-400 hover:text-indigo-600 transition-colors p-2"
                    title="View Order"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDownloadCsv(order.id, order.order_no)}
                    className="text-gray-400 hover:text-green-600 transition-colors p-2"
                    title="Export CSV"
                  >
                    <span className="inline-flex items-center gap-1">
                      <ArrowDownTrayIcon className="h-5 w-5" />
                      <span className="text-xs font-bold">CSV</span>
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      handleDownloadReceipt(order.id, order.order_no)
                    }
                    className="text-gray-400 hover:text-gray-900 transition-colors p-2"
                    title="Download Receipt"
                  >
                    <span className="inline-flex items-center gap-1">
                      <ArrowDownTrayIcon className="h-5 w-5" />
                      <span className="text-xs font-bold">RECEIPT</span>
                    </span>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {orders.length === 0 && !loading && (
          <div className="px-6 py-12 text-center text-gray-500 bg-gray-50 flex flex-col items-center">
            <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p>No orders found.</p>
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

      {/* Order Details Modal */}
      {selectedOrder && (
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
              onClick={() => setSelectedOrder(null)}
            ></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-gray-100 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6 opacity-100 translate-y-0 sm:scale-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg leading-6 font-bold text-gray-900">
                    Order {selectedOrder.order_no}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(selectedOrder.created_at)}
                  </p>
                </div>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedOrder.status === "completed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {selectedOrder.status}
                </span>
              </div>

              <div className="mt-4 border-t border-gray-200 py-4">
                <h4 className="font-semibold text-gray-900 mb-2">Items</h4>
                <ul className="divide-y divide-gray-100">
                  {selectedOrder.items?.map((item) => (
                    <li
                      key={item.id}
                      className="py-2 flex justify-between text-sm"
                    >
                      <div>
                        <span className="font-medium">{item.quantity}x</span>{" "}
                        {item.product_name}
                        <div className="text-xs text-gray-500">
                          SKU: {item.product_sku} @ $
                          {parseFloat(item.price).toFixed(2)}
                        </div>
                      </div>
                      <div className="font-medium">
                        ${parseFloat(item.subtotal).toFixed(2)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-900">
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Subtotal:</span>
                  <span>${parseFloat(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Discount:</span>
                    <span className="text-red-500">
                      -${parseFloat(selectedOrder.discount_amount).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Tax (8%):</span>
                  <span>
                    $
                    {(
                      Number.isFinite(Number(selectedOrder.tax))
                        ? Number(selectedOrder.tax)
                        : Number(selectedOrder.subtotal) * 0.08
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-lg font-bold border-t mt-2 pt-2">
                  <span>Total:</span>
                  <span>${parseFloat(selectedOrder.total).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 sm:flex sm:flex-row-reverse space-y-2 sm:space-y-0 sm:space-x-2 sm:space-x-reverse">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:w-auto sm:text-sm"
                >
                  Close
                </button>
                {selectedOrder.status === "completed" && (
                  <button
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:w-auto sm:text-sm"
                  >
                    <XCircleIcon className="mr-2 h-5 w-5" /> Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
