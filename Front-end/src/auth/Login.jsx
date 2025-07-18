import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, logout } from "../services/auth";
import ThemeToggle from "../components/ThemeToggle";
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
} from "../Icons";

// --- Main Login Page Component ---
export default function Login() {
  document.title = "Login - Care Management System";
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const reset = async () => {
      const token = localStorage.getItem("token");

      try {
        if (token !== undefined && token !== null) {
          localStorage.removeItem("token");
          await logout(token);
        }
      } catch (error) {
        // Optional: Log error in development only
        if (import.meta.env.MODE === "development") {
          console.error("Logout error:", error.response?.data || error.message);
        }
      } finally {
        navigate("/login");
        setIsMounted(true);
      }
    };

    reset();
  }, [navigate]);

  const isFormComplete = formData.email && formData.password;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await login(formData);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      // Corrected navigation logic: redirect to a dedicated admin route
      if (user.role === "admin") {
        navigate("/"); // Example admin route
      } else {
        navigate("/"); // Redirect to user dashboard
      }
    } catch (err) {
      setError(
        err.response?.data?.errors?.map((error) => error.msg) ||
          err.response?.data?.message ||
          "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 font-sans transition-colors duration-300">
      <ThemeToggle />
      <div
        className={`w-full max-w-md transform transition-all duration-700 ease-out ${
          isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="text-center mb-8">
          <img
            src="/logo3.png"
            alt="MindfulTrust Logo"
            className="mx-auto h-16 sm:h-20 block dark:hidden"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <img
            src="/logo2.png"
            alt="MindfulTrust Logo"
            className="mx-auto h-16 sm:h-20 hidden dark:block"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#1D2056] dark:text-slate-100 mb-2">
            Welcome Back!
          </h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-8">
            Sign in to continue to your dashboard.
          </p>

          {error && (
            <div
              className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-500/30 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg relative mb-6 flex items-center"
              role="alert"
            >
              <span className="mr-3 flex-shrink-0">
                <AlertCircleIcon size={20} />
              </span>
              <span className="block sm:inline text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                  <MailIcon />
                </span>
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982] transition-colors"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="relative">
                <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                  <LockIcon />
                </span>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982] transition-colors"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute top-[50%] -translate-y-1/2 right-3 cursor-pointer text-slate-400 hover:text-[#1D2056] dark:hover:text-slate-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="text-right my-6">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-[#FE4982] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormComplete}
              className="w-full bg-[#FE4982] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#E03A6D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-[#FE4982] transition-all duration-300 ease-in-out disabled:bg-opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Signing In...</span>
                </>
              ) : (
                <>Login</>
              )}
            </button>
          </form>

          <p className="text-sm mt-8 text-center text-slate-600 dark:text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#FE4982] hover:underline"
            >
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
