import { useState } from "react";
import { Link } from "react-router-dom";
import { CreditCardIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import Pagination from "../components/Pagination";
import { usePaginatedFetch } from "../hooks/usePaginatedFetch";

const METHOD_STYLES = {
  cash:    "bg-green-100 text-green-800",
  card:    "bg-blue-100 text-blue-800",
  qr:     "bg-purple-100 text-purple-800",
};

const METHODS = ["All", "cash", "card", "qr"];

export default function Payments() {
  const [methodFilter, setMethodFilter] = useState("");

  const {
    items: payments,
    loading,
    pagination,
    setPage,
  } = usePaginatedFetch("/payments", { method: methodFilter });

  if (loading && payments.length === 0)
    return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <CreditCardIcon className="w-7 h-7 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Transactions</h1>
            <p className="text-sm text-gray-500 mt-0.5">View all payment records and their associated orders.</p>
          </div>
        </div>

        {/* Method Filter */}
        <div className="flex gap-1 flex-wrap">
          {METHODS.map((m) => {
            const value = m === "All" ? "" : m;
            const active = methodFilter === value;
            return (
              <button
                key={m}
                onClick={() => { setMethodFilter(value); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all border ${
                  active
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {m === "qr" ? "QR" : m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="bg-white shadow-sm overflow-hidden rounded-xl border border-gray-200 flex flex-col">
        {/* Desktop Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <div className="col-span-2">Method</div>
          <div className="col-span-3">Amount Paid</div>
          <div className="col-span-2">Change</div>
          <div className="col-span-3">Order</div>
          <div className="col-span-2 text-right">Date</div>
        </div>

        <ul className="divide-y divide-gray-100 flex-1">
          {payments.map((payment) => {
            const methodClass = METHOD_STYLES[payment.method] ?? "bg-gray-100 text-gray-800";
            return (
              <li key={payment.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                {/* Mobile View */}
                <div className="md:hidden flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${methodClass}`}>
                        {payment.method}
                      </span>
                      {payment.order_no && (
                        <Link
                          to={`/orders?search=${payment.order_no}`}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                        >
                          #{payment.order_no}
                          <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      ${parseFloat(payment.amount).toFixed(2)}
                      {payment.change > 0 && (
                        <span className="text-gray-400 font-normal ml-2 text-xs">
                          (Change: ${parseFloat(payment.change).toFixed(2)})
                        </span>
                      )}
                    </p>
                    {payment.reference && (
                      <p className="text-xs text-gray-400 font-mono mt-0.5">Ref: {payment.reference}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{new Date(payment.paid_at).toLocaleString()}</p>
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${methodClass}`}>
                      {payment.method === "qr" ? "QR" : payment.method}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-sm font-bold text-gray-900">
                      ${parseFloat(payment.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="col-span-2">
                    {payment.change > 0 ? (
                      <span className="text-sm text-emerald-600 font-semibold">
                        ${parseFloat(payment.change).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </div>
                  <div className="col-span-3">
                    {payment.order_no ? (
                      <Link
                        to={`/orders?search=${payment.order_no}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        #{payment.order_no}
                        <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-xs text-gray-500">
                      {new Date(payment.paid_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {payments.length === 0 && !loading && (
          <div className="px-6 py-12 text-center text-gray-500 bg-gray-50 flex flex-col items-center">
            <CreditCardIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p>No payment records found.</p>
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
    </div>
  );
}
