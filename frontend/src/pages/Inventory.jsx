import { useState, useEffect } from "react";
import api from "../services/api";
import { CubeIcon } from "@heroicons/react/24/outline";
import Pagination from "../components/Pagination";

export default function Inventory() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [paginationData, setPaginationData] = useState({});

  useEffect(() => {
    fetchMovements(currentPage);
  }, [currentPage]);

  const fetchMovements = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/inventory?page=${page}`);
      const paginator = res.data.data;
      setMovements(paginator.data ? paginator.data : paginator);
      if (paginator.current_page) {
        setCurrentPage(paginator.current_page);
        setLastPage(paginator.last_page);
        setPaginationData(paginator);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case "in":
        return "bg-green-100 text-green-800";
      case "out":
        return "bg-orange-100 text-orange-800";
      case "sale":
        return "bg-blue-100 text-blue-800";
      case "adjust":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <CubeIcon className="w-8 h-8 text-indigo-600" />
        <h1 className="text-2xl font-semibold text-gray-900">
          Inventory Movements
        </h1>
      </div>

      <div className="bg-white shadow-sm overflow-hidden sm:rounded-xl border border-gray-200 flex flex-col">
        <ul className="divide-y divide-gray-100 flex-1">
          {movements.map((movement) => (
            <li
              key={movement.id}
              className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-indigo-600 truncate">
                    {movement.product.name}{" "}
                    <span className="text-gray-500 font-normal ml-2">
                      (SKU: {movement.product.sku})
                    </span>
                  </p>
                  <div className="mt-2 flex items-center text-sm text-gray-500 gap-4">
                    <span>
                      Stock changed by:{" "}
                      <strong
                        className={
                          movement.quantity > 0
                            ? "text-green-600"
                            : "text-red-500"
                        }
                      >
                        {movement.quantity > 0 ? "+" : ""}
                        {movement.quantity}
                      </strong>
                    </span>
                    <span className="text-gray-400">|</span>
                    <span>Before: {movement.stock_before}</span>
                    <span>→</span>
                    <span className="font-bold text-gray-900">
                      Current: {movement.stock_after}
                    </span>
                  </div>
                  {movement.description && (
                    <p className="mt-1 text-xs text-gray-500 italic">
                      {movement.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide border-transparent ${getTypeStyle(movement.type)}`}
                  >
                    {movement.type}
                  </span>
                  <div className="text-xs text-gray-500 text-right mt-1">
                    <p>{new Date(movement.created_at).toLocaleString()}</p>
                    <p>By User: {movement.user.name}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {movements.length === 0 && !loading && (
          <div className="px-6 py-12 text-center text-gray-500 bg-gray-50 flex flex-col items-center">
            <CubeIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p>No inventory movements recorded.</p>
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
    </div>
  );
}
