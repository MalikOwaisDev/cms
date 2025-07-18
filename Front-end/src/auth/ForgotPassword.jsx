import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import ThemeToggle from "../components/ThemeToggle";
import PasswordValidator from "../components/PasswordValidator";
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
  KeyIcon,
} from "../Icons";

// --- Main Forgot Password Page ---
export default function ForgotPassword() {
  document.title = "Forgot Password | Care Management System";
  const navigate = useNavigate();
  const [step, setStep] = useState("enterEmail"); // 'enterEmail', 'verifyOtp', 'resetPassword'
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    number: false,
    symbol: false,
  });
  const [timer, setTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(timerIntervalRef.current); // Cleanup timer on unmount
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "newPassword") validatePassword(value);
  };

  const validatePassword = (password) => {
    setPasswordValidation({
      length: password.length >= 8,
      number: /\d/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };
  const handleSendOtp = async () => {
    setError("");
    if (!formData.email) {
      setError("Please enter your email address.");
      setSuccess("");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/send-pass-otp`,
        { email: formData.email }
      );

      // Success: OTP sent
      setSuccess(`An OTP has been sent to ${formData.email}.`);
      setError(""); // Clear any previous errors
      setStep("verifyOtp");
      startTimer();
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || "Something went wrong";

      if (status === 400) {
        setError("Email is required.");
      } else if (status === 404) {
        setError("User not found. Please check your email address.");
      } else {
        setError(message);
      }

      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (formData.otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      setSuccess("");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/verify-otp`,
        {
          otp: formData.otp,
          email: formData.email,
        }
      );
      console.log(res);
      setSuccess("OTP verified successfully. You can now reset your password.");
      setStep("resetPassword");
      setError(""); // Clear previous errors on success
    } catch (err) {
      setError("Invalid OTP. Please try again.", err);
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setSuccess("");

    // Check if passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Check password validation status
    if (!Object.values(passwordValidation).every(Boolean)) {
      setError("Your new password does not meet the requirements.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/reset`,
        {
          email: formData.email,
          password: formData.newPassword,
        }
      );

      console.log("Password reset response:", res.data);

      setSuccess("Password has been reset successfully!");
      setError("");

      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Failed to reset password. Please try again.";
      setError(message);
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 font-sans transition-colors duration-300">
      <ThemeToggle />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/logo2.png"
            alt="MindfulTrust Logo"
            className="mx-auto h-16 sm:h-20"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1D2056] dark:text-slate-100">
              Forgot Password
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              {step === "enterEmail" &&
                "Enter your email to receive a verification code."}
              {step === "verifyOtp" &&
                "We've sent a code to your email. Please enter it below."}
              {step === "resetPassword" &&
                "Set a new, secure password for your account."}
            </p>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-500/30 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center">
              <span className="mr-3 flex-shrink-0">
                <AlertCircleIcon size={20} />
              </span>
              <span className="text-sm">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-500/30 text-green-800 dark:text-green-300 px-4 py-3 rounded-lg mb-6">
              <p className="text-sm">{success}</p>
            </div>
          )}

          {step === "enterEmail" && (
            <div className="space-y-4">
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
                />
              </div>
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-[#FE4982] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#E03A6D] disabled:bg-opacity-60"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          )}

          {step === "verifyOtp" && (
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                  <KeyIcon />
                </span>
                <input
                  name="otp"
                  type="text"
                  placeholder="6-Digit OTP"
                  maxLength="6"
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 tracking-[0.5em] text-center border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                  value={formData.otp}
                  onChange={handleChange}
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-opacity-60"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
                <button
                  onClick={handleSendOtp}
                  disabled={isTimerActive}
                  className="flex-shrink-0 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-3 px-4 rounded-lg disabled:opacity-60"
                >
                  {isTimerActive ? `Resend (${timer}s)` : "Resend"}
                </button>
              </div>
            </div>
          )}

          {step === "resetPassword" && (
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                  <LockIcon />
                </span>
                <input
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  className="w-full pl-10 pr-10 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute top-[50%] -translate-y-1/2 right-3 cursor-pointer text-slate-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <div className="relative">
                <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                  <LockIcon />
                </span>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm New Password"
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              <PasswordValidator validation={passwordValidation} />
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full bg-[#FE4982] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#E03A6D] disabled:bg-opacity-60"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          )}

          <p className="text-sm mt-8 text-center text-slate-600 dark:text-slate-400">
            Remembered your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#FE4982] hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
