import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCaregiver } from "../services/caregiver";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ImageUpload from "../components/ImageUpload";
import PasswordValidator from "../components/PasswordValidator"; // Import validator
import {
  BackIcon,
  UserIcon,
  MailIcon,
  LockIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeOffIcon,
} from "../Icons"; // Import all necessary icons

export default function NewCaregiver() {
  document.title = "Add Caregiver | Care Management System";
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "caregiver",
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State for password visibility and validation
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    number: false,
    symbol: false,
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validatePassword = (password) => {
    const newValidation = {
      length: password.length >= 8,
      number: /\d/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPasswordValidation(newValidation);
    return Object.values(newValidation).every(Boolean);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate password in real-time
    if (name === "password") {
      validatePassword(value);
    }
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("Name, Email, and Password are required fields.");
      setLoading(false);
      return;
    }

    if (!isPasswordValid) {
      setError("Password does not meet all requirements.");
      setLoading(false);
      return;
    }

    try {
      const payload = { ...formData, avatar };
      await createCaregiver(payload, token);
      navigate("/caregivers");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create caregiver.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
            >
              <BackIcon />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Add New Caregiver
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Create a profile for a new user.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm"
          >
            <div className="grid md:grid-cols-3 gap-8 p-8">
              {/* Left Column: Avatar */}
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  Profile Photo
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  This will be displayed on their profile.
                </p>
                <ImageUpload
                  preview={avatarPreview}
                  onFileChange={handleFileChange}
                />
              </div>

              {/* Right Column: Form Fields */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <UserIcon className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="block w-full pl-10 pr-3 py-2 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-[#FE4982] focus:border-[#FE4982]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <MailIcon className="w-5 h-5" />
                    </span>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="block w-full pl-10 pr-3 py-2 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-[#FE4982] focus:border-[#FE4982]"
                    />
                  </div>
                </div>

                {/* Password Input with Validator */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <LockIcon className="w-5 h-5" />
                    </span>
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="block w-full pl-10 pr-10 py-2 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-[#FE4982] focus:border-[#FE4982]"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {/* Show validator only when user starts typing password */}
                  {formData.password && (
                    <PasswordValidator validation={passwordValidation} />
                  )}
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Role
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <ShieldCheckIcon className="w-5 h-5" />
                    </span>
                    <select
                      name="role"
                      id="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="block w-full pl-10 appearance-none pr-3 py-2 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-[#FE4982] focus:border-[#FE4982]"
                    >
                      <option value="caregiver">Caregiver</option>
                      <option value="admin">Admin</option>
                      {/* <option value="family">Family</option> */}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
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
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-4 rounded-b-xl flex justify-between items-center">
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
              <div className="flex-grow"></div>
              <button
                type="submit"
                disabled={loading || !isPasswordValid}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#FE4982] hover:bg-[#e63a6d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FE4982] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save Caregiver"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
