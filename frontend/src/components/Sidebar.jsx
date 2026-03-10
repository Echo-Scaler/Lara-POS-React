import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  HomeIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  CubeIcon,
  UsersIcon,
  TagIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: HomeIcon,
      roles: ["admin", "manager", "cashier"],
    },
    {
      name: "POS Screen",
      path: "/pos",
      icon: ShoppingCartIcon,
      roles: ["admin", "manager", "cashier"],
    },
    {
      name: "Orders",
      path: "/orders",
      icon: ClipboardDocumentListIcon,
      roles: ["admin", "manager", "cashier"],
    },
    {
      name: "Customers",
      path: "/customers",
      icon: UsersIcon,
      roles: ["admin", "manager", "cashier"],
    },
    {
      name: "Payments",
      path: "/payments",
      icon: CreditCardIcon,
      roles: ["admin", "manager"],
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: CubeIcon,
      roles: ["admin", "manager"],
    },
  ];

  const adminItems = [
    {
      name: "Products",
      path: "/admin/products",
      icon: TagIcon,
      roles: ["admin", "manager"],
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: TagIcon,
      roles: ["admin", "manager"],
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: UsersIcon,
      roles: ["admin", "manager"],
    },
  ];

  const filterNav = (items) =>
    items.filter((item) => item.roles.includes(user?.role));

  return (
    <div className="flex h-screen w-64 flex-col bg-white border-r shadow-sm">
      <div className="flex h-16 items-center justify-center border-b px-4">
        <h1 className="text-2xl font-bold text-indigo-600">SmartPOS</h1>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 space-y-1 px-2">
          {filterNav(navItems).map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <item.icon
                className="mr-3 h-5 w-5 flex-shrink-0"
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}

          {filterNav(adminItems).length > 0 && (
            <>
              <div className="mt-8 mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Administration
              </div>
              {filterNav(adminItems).map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <item.icon
                    className="mr-3 h-5 w-5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  {item.name}
                </NavLink>
              ))}
            </>
          )}
        </nav>
      </div>

      <div className="border-t p-4 flex items-center">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user?.name}
          </p>
          <p className="text-xs text-gray-500 truncate capitalize">
            {user?.role}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="ml-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          title="Logout"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
