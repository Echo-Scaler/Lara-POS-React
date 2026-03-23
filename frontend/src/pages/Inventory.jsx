import { useState } from "react";
import { CubeIcon } from "@heroicons/react/24/outline";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import { usePaginatedFetch } from "../hooks/usePaginatedFetch";

const TYPE_STYLES = {
  in:     "bg-green-100 text-green-800",
  out:    "bg-orange-100 text-orange-800",
  sale:   "bg-blue-100 text-blue-800",
  adjust: "bg-purple-100 text-purple-800",
  return: "bg-red-100 text-red-800",
};

const TYPES = ["All", "sale", "return", "in", "out", "adjust"];

export default function Inventory() {
  const [typeFilter, setTypeFilter] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const {
    items: movements,
    loading,
    pagination,
    setPage,
    refresh,
  } = usePaginatedFetch("/inventory", { type: typeFilter, search: productSearch });

  if (loading && movements.length === 0)
    return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <CubeIcon className="w-7 h-7 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Movements</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track all stock changes across every product.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <SearchBar
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            onClear={() => { setProductSearch(""); setPage(1); }}
            placeholder="Search product..."
            className="sm:w-56"
          />
          <div className="flex gap-1 flex-wrap">
            {TYPES.map((t) => {
              const value = t === "All" ? "" : t;
              const active = typeFilter === value;
              return (
                <button
                  key={t}
                  onClick={() => { setTypeFilter(value); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all border ${
                    active
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white shadow-sm overflow-hidden rounded-xl border border-gray-200 flex flex-col">
        <ul className="divide-y divide-gray-100 flex-1">
          {movements.map((movement) => {
            const typeClass = TYPE_STYLES[movement.type] ?? "bg-gray-100 text-gray-800";
            return (
              <li key={movement.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-semibold text-indigo-600 truncate">
                      {movement.product.name}{" "}
                      <span className="text-gray-400 font-normal ml-1">
                        (SKU: {movement.product.sku})
                      </span>
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span>
                        Stock changed by:{" "}
                        <strong className={movement.quantity > 0 ? "text-green-600" : "text-red-500"}>
                          {movement.quantity > 0 ? "+" : ""}{movement.quantity}
                        </strong>
                      </span>
                      <span className="text-gray-300">|</span>
                      <span>Before: {movement.stock_before}</span>
                      <span>→</span>
                      <span className="font-bold text-gray-900">After: {movement.stock_after}</span>
                    </div>
                    {movement.description && (
                      <p className="mt-1 text-xs text-gray-400 italic">{movement.description}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${typeClass}`}>
                      {movement.type}
                    </span>
                    <div className="text-xs text-gray-400 text-right">
                      <p>{new Date(movement.created_at).toLocaleString()}</p>
                      <p>By: {movement.user.name}</p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {movements.length === 0 && !loading && (
          <div className="px-6 py-12 text-center text-gray-500 bg-gray-50 flex flex-col items-center">
            <CubeIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p>No inventory movements found.</p>
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
