import { useState, useEffect } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem("remember_email") || "";
    } catch {
      return "";
    }
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return Boolean(localStorage.getItem("remember_email"));
    } catch {
      return false;
    }
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return null; // or a spinner
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await login(email, password);

    if (res.success) {
      try {
        if (rememberMe) localStorage.setItem("remember_email", email);
        else localStorage.removeItem("remember_email");
      } catch {
        // ignore
      }
      navigate("/dashboard", { replace: true });
    } else {
      setError(res.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] border border-white p-10">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-sm">
              SP
            </div>
            <h2 className="mt-5 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
              SmartPOS
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to your account
            </p>
          </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded text-sm text-center border border-red-100">
              {error}
            </div>
          )}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="email"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="admin@pos.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 pl-3 pr-14 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 text-xs font-bold text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Remember email
            </label>
            <button
              type="button"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              onClick={() => alert("Please contact admin to reset password.")}
            >
              Forgot password?
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
