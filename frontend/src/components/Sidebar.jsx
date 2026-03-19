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
  UserCircleIcon,
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
      <div className="h-16 px-4 border-b flex items-center">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-sm">
          SP
        </div>
        <div className="ml-3">
          <div className="text-lg font-extrabold text-gray-900 leading-tight">
            SmartPOS
          </div>
          <div className="text-xs font-semibold text-gray-500 leading-tight">
            {(user?.role || "user").toString().toUpperCase()}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 space-y-1 px-2">
          {filterNav(navItems).map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
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
              <div className="mt-8 mb-2 px-3 text-xs font-extrabold uppercase tracking-wider text-gray-400">
                Administration
              </div>
              {filterNav(adminItems).map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
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

      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-slate-50 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-black shadow-sm">
                {(user?.name || "U").slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-extrabold text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate capitalize font-semibold">
              {user?.role}
            </p>
          </div>
        </div>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-extrabold transition-all border ${
              isActive
                ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`
          }
        >
          <UserCircleIcon className="h-5 w-5" />
          My Profile
        </NavLink>
        <button
          onClick={handleLogout}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-extrabold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
