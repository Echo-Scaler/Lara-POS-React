import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear field error when user starts typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.password_confirmation
    );

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
      if (result.errors) {
        setFieldErrors(result.errors);
      }
    }
    setLoading(false);
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
              Create Account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join SmartPOS today
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded text-sm text-center border border-red-100">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.name[0]}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.email[0]}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.password[0]}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  name="password_confirmation"
                  type="password"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  loading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Creating account..." : "Sign up"}
              </button>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
