import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Input class – highlights red when there's an error for that field */
const inputClass = (fieldErrors, name) =>
  `relative block w-full appearance-none rounded-md border px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:outline-none focus:ring-indigo-500 sm:text-sm ${
    fieldErrors[name]
      ? "border-red-400 bg-red-50 focus:border-red-500"
      : "border-gray-300 focus:border-indigo-500"
  }`;

/** Shows the first error message for a given field */
const FieldError = ({ errors, name }) =>
  errors[name] ? (
    <p className="mt-1 text-xs text-red-600 font-medium">{errors[name][0]}</p>
  ) : null;

/** Reusable labelled field wrapper */
const FormField = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
  </div>
);

// ─── Fields config ───────────────────────────────────────────────────────────
const FIELDS = [
  { name: "name",                 label: "Full Name",        type: "text",     placeholder: "John Doe" },
  { name: "email",                label: "Email Address",    type: "email",    placeholder: "email@example.com" },
  { name: "password",             label: "Password",         type: "password", placeholder: "••••••••" },
  { name: "password_confirmation",label: "Confirm Password", type: "password", placeholder: "••••••••" },
];

// ─── Component ───────────────────────────────────────────────────────────────
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the field error as soon as the user types
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: null }));
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
      formData.password_confirmation,
    );

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
      if (result.errors) setFieldErrors(result.errors);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] border border-white p-10">
          {/* Brand mark */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-sm">
              SP
            </div>
            <h2 className="mt-5 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
              Create Account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">Join SmartPOS today</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {/* General error banner */}
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center border border-red-100">
                {error}
              </div>
            )}

            {/* All fields rendered from config */}
            {FIELDS.map(({ name, label, type, placeholder }) => (
              <FormField key={name} label={label}>
                <input
                  name={name}
                  type={type}
                  placeholder={placeholder}
                  value={formData[name]}
                  onChange={handleChange}
                  className={inputClass(fieldErrors, name)}
                />
                <FieldError errors={fieldErrors} name={name} />
              </FormField>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating account…" : "Sign up"}
            </button>

            <p className="text-center text-sm text-gray-600 mt-2">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
