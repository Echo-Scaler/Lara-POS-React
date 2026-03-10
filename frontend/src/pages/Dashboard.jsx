import { useState, useEffect } from "react";
import api from "../services/api";
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get("/reports/dashboard");
      setStats(data.data);
    } catch (error) {
      console.error("Failed to load dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-semibold text-gray-900">Today's Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Today's Revenue
                  </dt>
                  <dd>
                    <div className="text-2xl font-bold text-gray-900">
                      ${stats?.sales_today?.toFixed(2) || "0.00"}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBagIcon className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Orders Today
                  </dt>
                  <dd>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats?.orders_today || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Low Stock Items
                  </dt>
                  <dd>
                    <div className="text-2xl font-bold text-red-600">
                      {stats?.low_stock_products?.length || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Top Selling Products (30 Days)
          </h2>
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {stats?.top_products?.map((product, idx) => (
                <li key={idx} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {product.image_url ? (
                        <img
                          className="h-8 w-8 rounded object-cover"
                          src={product.image_url}
                          alt=""
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center text-gray-500 text-xs text-center border">
                          No Img
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="truncate text-sm text-gray-500">
                        {product.total_sold} sold
                      </p>
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ${parseFloat(product.total_revenue).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
              {(!stats?.top_products || stats.top_products.length === 0) && (
                <li className="py-4 text-center text-sm text-gray-500">
                  No sales data found
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white shadow rounded-lg p-6 border-t-4 border-red-500">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            Stock Alerts
          </h2>
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {stats?.low_stock_products?.slice(0, 5)?.map((product, idx) => (
                <li
                  key={idx}
                  className="py-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500 text-left">
                      SKU: {product.sku}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">
                      Stock: {product.stock}
                    </p>
                    <p className="text-xs text-gray-500">
                      Threshold: {product.low_stock_threshold}
                    </p>
                  </div>
                </li>
              ))}
              {stats?.low_stock_products?.length > 5 && (
                <li className="py-4 text-center">
                  <span className="text-sm text-indigo-600 hover:text-indigo-900 cursor-pointer text-center block">
                    View all {stats.low_stock_products.length} alerts
                  </span>
                </li>
              )}
              {(!stats?.low_stock_products ||
                stats.low_stock_products.length === 0) && (
                <li className="py-4 text-center text-sm text-gray-500 text-left">
                  All stock levels are optimal
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
