import { useState, useEffect } from "react";
import api from "../services/api";
import { CreditCardIcon } from "@heroicons/react/24/outline";
import Pagination from "../components/Pagination";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [paginationData, setPaginationData] = useState({});

  useEffect(() => {
    fetchPayments(currentPage);
  }, [currentPage]);

  const fetchPayments = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/payments?page=${page}`);
      const paginator = res.data.data;
      setPayments(paginator.data ? paginator.data : paginator);
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

  const getMethodColor = (method) => {
    switch (method) {
      case "cash":
        return "bg-green-100 text-green-800";
      case "card":
        return "bg-blue-100 text-blue-800";
      case "qr":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Payment Transactions
      </h1>

      <div className="bg-white shadow-sm overflow-hidden sm:rounded-xl border border-gray-200 flex flex-col">
        <ul className="divide-y divide-gray-100 flex-1">
          {payments.map((payment) => (
            <li key={payment.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col">
                  <p className="font-semibold text-gray-900 border-gray-100">
                    Amount: ${parseFloat(payment.amount).toFixed(2)}
                    {payment.change > 0 && (
                      <span className="font-normal text-gray-500 ml-2">
                        (Change: ${parseFloat(payment.change).toFixed(2)})
                      </span>
                    )}
                  </p>
                  <p className="text-gray-500 mt-1">
                    Paid at: {new Date(payment.paid_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide border-transparent ${getMethodColor(payment.method)}`}
                  >
                    {payment.method}
                  </span>
                  {payment.reference && (
                    <span className="text-xs text-gray-500 font-mono">
                      Ref: {payment.reference}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
        {payments.length === 0 && !loading && (
          <div className="px-6 py-12 text-center text-gray-500 bg-gray-50 flex flex-col items-center">
            <CreditCardIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p>No payment records found.</p>
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
