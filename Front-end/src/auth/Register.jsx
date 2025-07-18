import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { register, logout } from "../services/auth";
import PasswordValidator from "../components/PasswordValidator";
import ThemeToggle from "../components/ThemeToggle";
import {
  UserIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
  KeyIcon,
} from "../Icons";

// --- Main Register Page Component ---
export default function Register() {
  document.title = "Register - Care Management System";
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "caregiver",
    otp: "",
  });
  const [avatarFile, setAvatarFile] = useState({});
  const [avatarPreview, setAvatarPreview] = useState();
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    number: false,
    symbol: false,
  });
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const fileInputRef = useRef(null);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    return () => clearInterval(timerIntervalRef.current);
  }, []);

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
        navigate("/register");
        setIsMounted(true);
      }
    };

    reset();
  }, [navigate]);

  const startTimer = () => {
    setIsTimerActive(true);
    setTimer(60);
    timerIntervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          setIsTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const isFormComplete = formData.name && formData.email && formData.password;

  const validatePassword = (password) => {
    setPasswordValidation({
      length: password.length >= 8,
      number: /\d/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "password") validatePassword(value);
  };
  const handleSendOtp = async () => {
    setError("");

    // Validate form before sending OTP
    if (!isFormComplete || !isPasswordValid) {
      setError(
        "Please fill all details and ensure password is valid before sending OTP."
      );
      return;
    }

    setOtpLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/send-otp`,
        {
          email: formData.email,
          name: formData.name,
        }
      );

      console.log("OTP send response:", res);

      setOtpSent(true);
      startTimer();
    } catch (err) {
      // Extract meaningful error message from axios error object
      const message =
        err?.response?.data?.message || "Failed to send OTP. Please try again.";

      setError(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (formData.otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    setVerifyLoading(true);
    setError("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/verify-otp`,
        {
          otp: formData.otp,
          email: formData.email,
        }
      );
      console.log(res);
      setIsOtpVerified(true);
    } catch (err) {
      setError("Invalid OTP. Please try again.", err);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("role", formData.role);
    if (avatarFile) data.append("avatar", avatarFile);

    try {
      const res = await register(data);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      // Corrected navigation logic: redirect to a dedicated admin route
      if (user.role === "admin") {
        navigate("/"); // Example admin route
      } else {
        navigate("/"); // Redirect to user dashboard
      }
    } catch (err) {
      console.log(err);
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
    <div className="flex relative justify-center items-center p-4 min-h-screen font-sans transition-colors duration-300 bg-slate-50 dark:bg-slate-900">
      <ThemeToggle />
      <div
        className={`w-full max-w-md transform transition-all duration-700 ease-out ${
          isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="mb-8 text-center">
          <img
            src="/logo3.png"
            alt="MindfulTrust Logo"
            className="block mx-auto h-16 sm:h-20 dark:hidden"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <img
            src="/logo2.png"
            alt="MindfulTrust Logo"
            className="hidden mx-auto h-16 sm:h-20 dark:block"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>

        <div className="p-6 bg-white rounded-2xl shadow-lg dark:bg-slate-800 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#1D2056] dark:text-slate-100 mb-2">
            Create Your Account
          </h2>
          <p className="mb-8 text-center text-slate-500 dark:text-slate-400">
            Join our community of care professionals.
          </p>

          {error && (
            <div
              className="flex relative items-center px-4 py-3 mb-6 text-red-800 bg-red-100 rounded-lg border border-red-300 dark:bg-red-900/20 dark:border-red-500/30 dark:text-red-300"
              role="alert"
            >
              <span className="flex-shrink-0 mr-3">
                <AlertCircleIcon size={20} />
              </span>
              <span className="block text-sm sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-2">
                <div className="flex overflow-hidden justify-center items-center w-24 h-24 rounded-full border-2 border-white shadow-sm bg-slate-100 dark:bg-slate-700 dark:border-slate-600">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar Preview"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="flex justify-center items-center w-12 h-12 text-slate-400 dark:text-slate-500">
                      <UserIcon size={30} />
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="text-sm font-semibold text-[#FE4982] hover:underline"
                  disabled={otpSent}
                >
                  Upload Photo
                </button>
              </div>
              <div className="relative">
                <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                  <UserIcon />
                </span>
                <input
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={otpSent}
                />
              </div>
              <div className="relative">
                <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                  <MailIcon />
                </span>
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={otpSent}
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
                  className="w-full pl-10 pr-10 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={otpSent}
                />
                <button
                  type="button"
                  className="absolute top-[50%] -translate-y-1/2 right-3 cursor-pointer text-slate-400 hover:text-[#1D2056] dark:hover:text-slate-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <PasswordValidator validation={passwordValidation} />
              <div className="relative my-4">
                <select
                  name="role"
                  id="role"
                  className="w-full p-3 pr-10 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={otpSent}
                >
                  <option value="caregiver">Caregiver</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="flex absolute inset-y-0 right-3 items-center pointer-events-none text-slate-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {!otpSent && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading || !isFormComplete || !isPasswordValid}
                  className="flex gap-2 justify-center items-center px-4 py-3 w-full font-bold text-white rounded-lg transition-all bg-slate-600 dark:bg-slate-500 hover:bg-slate-700 dark:hover:bg-slate-600 disabled:bg-opacity-60 disabled:cursor-not-allowed"
                >
                  {otpLoading ? "Sending..." : "Send OTP"}
                </button>
              )}

              {otpSent && !isOtpVerified && (
                <div className="pt-4 space-y-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="relative">
                    <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                      <KeyIcon />
                    </span>
                    <input
                      name="otp"
                      type="text"
                      placeholder="6-Digit OTP"
                      maxLength="6"
                      value={formData.otp}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 tracking-[0.5em] text-center border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                      required
                    />
                  </div>
                  <div className="flex gap-4 items-center">
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyLoading}
                      className="flex gap-2 justify-center items-center px-4 py-3 w-full font-bold text-white bg-blue-600 rounded-lg transition-all hover:bg-blue-700 disabled:bg-opacity-60"
                    >
                      {verifyLoading ? "Verifying..." : "Verify OTP"}
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isTimerActive}
                      className="flex-shrink-0 px-4 py-3 font-bold rounded-lg transition-all bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isTimerActive ? `Resend (${timer}s)` : "Resend"}
                    </button>
                  </div>
                </div>
              )}

              {isOtpVerified && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FE4982] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#E03A6D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-[#FE4982] transition-all disabled:bg-opacity-60"
                >
                  {loading ? "Registering..." : "Complete Registration"}
                </button>
              )}
            </div>
          </form>

          <p className="mt-8 text-sm text-center text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#FE4982] hover:underline"
            >
              Login Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
