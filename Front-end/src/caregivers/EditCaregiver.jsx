import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCaregiverById, updateCaregiver } from "../services/caregiver";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ImageUpload from "../components/ImageUpload";
import PasswordValidator from "../components/PasswordValidator"; // Import the validator
import {
  BackIcon,
  UserIcon,
  MailIcon,
  ShieldCheckIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
} from "../Icons"; // Import new icons
import Spinner from "../components/Spinner";

export default function EditCaregiver() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Add password fields to state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [existingAvatar, setExistingAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  // State for password visibility and validation
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    number: false,
    symbol: false,
  });

  useEffect(() => {
    const fetchCaregiver = async () => {
      setPageLoading(true); // Set loading state at the start
      try {
        const response = await getCaregiverById(id, token);
        const { name, email, role, avatar } = response.data;

        // Update form data
        setFormData((prev) => ({ ...prev, name, email, role }));

        // Handle avatar if exists
        if (avatar) {
          setExistingAvatar(avatar);
        }

        // Set document title
        document.title = `Edit ${name ? name : "Caregiver"} | Caregiver`;
      } catch (err) {
        console.error("Error fetching caregiver:", err);
        setError(
          err?.response?.data?.message || "Failed to load caregiver data."
        );
      } finally {
        setPageLoading(false); // Ensure loading state is cleared
      }
    };

    fetchCaregiver();
  }, [id, token]);

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

  // Central handler for all form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If changing password, validate it
    if (name === "password") {
      validatePassword(value);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // --- Password Validation Logic ---
    if (formData.password) {
      // Only validate if a new password is typed
      if (formData.password !== formData.confirmPassword) {
        setError("New passwords do not match.");
        return;
      }
      if (!validatePassword(formData.password)) {
        setError("New password does not meet the requirements.");
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };
      if (avatar) {
        payload.avatar = avatar;
      }
      // **Only include the password in the payload if it's being changed**
      if (formData.password) {
        payload.password = formData.password;
      }

      await updateCaregiver(id, payload, token);
      navigate(`/caregivers/view/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update caregiver.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading)
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <div className="h-screen flex items-center justify-center">
          <Spinner />
        </div>
        <Footer />
      </div>
    );

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
                Edit Caregiver
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Update the profile for {formData.name}.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm"
          >
            <div className="grid md:grid-cols-3 gap-x-8 gap-y-10 p-8">
              {/* Left Column: Avatar */}
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  Profile Photo
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Update the user's profile picture.
                </p>
                <ImageUpload
                  preview={avatarPreview}
                  onFileChange={handleFileChange}
                  existingAvatar={existingAvatar}
                />
              </div>

              {/* Right Column: Profile Details */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    Personal Details
                  </h3>
                </div>
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <UserIcon size={20} />
                    </span>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="block w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-700 border border-slate-300  dark:border-slate-600 text-slate-800 dark:text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-[#FE4982] focus:border-[#FE4982]"
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
                      <MailIcon />
                    </span>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="block w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-[#FE4982] focus:border-[#FE4982]"
                    />
                  </div>
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
                      <ShieldCheckIcon />
                    </span>
                    <select
                      name="role"
                      id="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 appearance-none bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-[#FE4982] focus:border-[#FE4982]"
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

              {/* --- NEW: Password Section --- */}
              <div className="md:col-span-3 border-t border-slate-200 dark:border-slate-700 pt-8 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    Update Password
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Leave these fields blank to keep the current password.
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    New Password
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
                      className="block w-full pl-10 pr-10 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-[#FE4982] focus:border-[#FE4982]"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {formData.password && (
                    <PasswordValidator validation={passwordValidation} />
                  )}
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <LockIcon className="w-5 h-5" />
                    </span>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-[#FE4982] focus:border-[#FE4982]"
                    />
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
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#FE4982] hover:bg-[#e63a6d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FE4982] disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
