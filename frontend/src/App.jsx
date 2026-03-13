import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

// Pages (to be implemented)
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import Inventory from "./pages/Inventory";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Users from "./pages/admin/Users";
import Customers from "./pages/Customers";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/customers" element={<Customers />} />

              <Route
                element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}
              >
                <Route path="/payments" element={<Payments />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/admin/products" element={<Products />} />
                <Route path="/admin/categories" element={<Categories />} />
              </Route>

              <Route
                element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}
              >
                <Route path="/admin/users" element={<Users />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
