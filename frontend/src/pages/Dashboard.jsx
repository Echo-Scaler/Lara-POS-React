import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  UserGroupIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
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
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <div className="animate-pulse text-indigo-500 font-semibold text-lg flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading dashboard...
        </div>
      </div>
    );
  }

  // Reverse the sales chart array for Recharts to plot chronologically
  const chartData = stats?.sales_chart ? [...stats.sales_chart].reverse() : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <Link
          to={`/orders?date=${new Date().toISOString().split("T")[0]}`}
          className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1 block"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-50 p-3 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Today's Revenue
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    ${stats?.sales_today?.toFixed(2) || "0.00"}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link
          to={`/orders?date=${new Date().toISOString().split("T")[0]}`}
          className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1 block"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-50 p-3 rounded-lg">
                <ShoppingBagIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Orders Today
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {stats?.orders_today || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link
          to="/customers"
          className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1 block"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-50 p-3 rounded-lg">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Customers
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {stats?.total_customers || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1 block"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-50 p-3 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Staff / Users
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {stats?.total_users || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/products"
          className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1 block"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-orange-50 p-3 rounded-lg">
                <CubeIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Total Products
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {stats?.total_products || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Revenue Trend (Last 7 Days)
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 13 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 13 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value) => [`$${value.toFixed(2)}`, "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{
                    r: 6,
                    stroke: "#4F46E5",
                    strokeWidth: 2,
                    fill: "#fff",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-600"></div>
          <div className="flex flex-col mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              Stock Alerts
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Items under 7 counts stock
            </p>
          </div>
          <div className="flow-root mt-4">
            <ul className="-my-4 divide-y divide-gray-100">
              {stats?.low_stock_products?.slice(0, 5)?.map((product, idx) => (
                <li
                  key={idx}
                  className="py-4 flex items-center justify-between group"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      {product.stock} left
                    </div>
                  </div>
                </li>
              ))}
              {stats?.low_stock_products?.length > 5 && (
                <li className="py-4 text-center">
                  <Link
                    to="/admin/products?filter=low_stock"
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer transition-colors"
                  >
                    View all {stats.low_stock_products.length} alerts →
                  </Link>
                </li>
              )}
              {(!stats?.low_stock_products ||
                stats.low_stock_products.length === 0) && (
                <li className="py-8 text-center flex flex-col items-center justify-center text-gray-500">
                  <div className="bg-green-50 p-3 rounded-full mb-3">
                    <ShoppingBagIcon className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="text-sm font-medium">
                    All stock levels are optimal
                  </p>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Top Selling Products (30 Days)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats?.top_products?.map((product, idx) => (
            <div
              key={idx}
              className="border border-gray-100 rounded-xl p-4 flex flex-col items-center text-center hover:border-indigo-100 hover:bg-indigo-50/50 transition-colors"
            >
              <div className="h-16 w-16 mb-3">
                {product.image_url ? (
                  <img
                    className="h-full w-full rounded-full object-cover shadow-sm ring-2 ring-white"
                    src={product.image_url}
                    alt={product.name}
                  />
                ) : (
                  <div className="h-full w-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 text-xs shadow-sm ring-2 ring-white">
                    No Img
                  </div>
                )}
              </div>
              <h3
                className="text-sm font-semibold text-gray-900 truncate w-full"
                title={product.name}
              >
                {product.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1 mb-2">
                {product.total_sold} units sold
              </p>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 w-full justify-center">
                ${parseFloat(product.total_revenue).toFixed(2)} rev
              </span>
            </div>
          ))}
          {(!stats?.top_products || stats.top_products.length === 0) && (
            <div className="col-span-full py-8 text-center text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
              No sales data found for the past 30 days
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
