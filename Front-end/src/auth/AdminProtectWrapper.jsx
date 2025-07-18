import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getMe } from "../services/auth";
import Header from "../components/Header";

const AdminProtectWrapper = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token");
        return;
      }

      try {
        const res = await getMe(token);

        if (res.data.role === "admin") {
          setAuthorized(true);
        } else {
          setError("Admins only");
        }
      } catch (err) {
        console.error("Authorization check failed", err);
        setError("Unauthorized access");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Header />
        <div className="w-full h-[85vh] flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4">
            {/* Animated SVG Spinner */}
            <svg
              className="animate-spin h-10 w-10 text-[#FE4982]"
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

            {/* Styled Loading Text */}
            <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
              Loading profile...
            </p>
          </div>
        </div>
      </div>
    );
  if (error) {
    return <Navigate to="/" state={{ error }} replace />;
  }
  if (!authorized) {
    return <Navigate to="/" state={{ error: "Admins only" }} replace />;
  }

  return <>{children}</>;
};

export default AdminProtectWrapper;
