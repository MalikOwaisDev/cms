import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useUser } from "./hooks/useUser";
import { UserIcon, CameraIcon, SaveIcon, BackIcon, TrashIcon } from "./Icons";
import axios from "axios";

// --- Constants ---
const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// --- Date Helper Function ---
const getWeekDates = () => {
  const weekDates = {};
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(today.getDate() - diff);

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dayName = DAYS_OF_WEEK[i];
    weekDates[dayName] = date.toISOString().split("T")[0];
  }
  return weekDates;
};

// --- Profile Page ---
export default function ProfilePage() {
  const navigate = useNavigate();
  const { userQuery, updateUserMutation } = useUser();
  const { data: user, isLoading, isError, error } = userQuery;
  const [isEditMode, setIsEditMode] = useState(false);

  document.title = `${
    user && user.name ? user.name : "My"
  } Profile | Care Management System`;

  const [formData, setFormData] = useState({
    name: "",
    availability: [],
    absences: [],
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [isAvailabilityUpdating, setIsAvailabilityUpdating] = useState(false);

  const [weekDates, setWeekDates] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    if (user) {
      setFormData({
        name: user?.name || "",
        // Ensure availability is an array, defaulting to empty if null/undefined
        availability: user?.availability || [],
        absences: user?.absences || [],
      });
      setAvatarPreview(user?.avatar);
    }
    setWeekDates(getWeekDates());
  }, [navigate, user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGoBack = () => {
    if (window.history.state && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- MODIFIED: Availability handler for checkbox ---
  const handleAvailabilityChange = (day, date, isAvailable) => {
    let newAvailability = [...(formData.availability || [])];

    if (isAvailable) {
      // Add or update the day's availability
      const existingDayIndex = newAvailability.findIndex((d) => d.day === day);
      const availabilityData = { day, date, isAvailable: true };

      if (existingDayIndex > -1) {
        newAvailability[existingDayIndex] = availabilityData;
      } else {
        newAvailability.push(availabilityData);
      }
    } else {
      // Remove the day's availability if checkbox is unchecked
      newAvailability = newAvailability.filter((d) => d.day !== day);
    }

    setFormData({ ...formData, availability: newAvailability });
  };

  const handleAddAbsence = () => {
    const newAbsences = [
      ...(formData.absences || []),
      { date: "", reason: "" },
    ];
    setFormData({ ...formData, absences: newAbsences });
  };

  const handleAbsenceChange = (index, field, value) => {
    const newAbsences = [...formData.absences];
    newAbsences[index][field] = value;
    setFormData({ ...formData, absences: newAbsences });
  };

  const handleRemoveAbsence = (index) => {
    const newAbsences = formData.absences.filter((_, i) => i !== index);
    setFormData({ ...formData, absences: newAbsences });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsProfileUpdating(true);
    const dataToUpdate = new FormData();
    dataToUpdate.append("name", formData.name);

    if (avatarFile) {
      dataToUpdate.append("avatar", avatarFile);
    }

    updateUserMutation.mutate(dataToUpdate, {
      onSuccess: () => {
        setSuccess("Profile details updated successfully!");
        setTimeout(() => setSuccess(""), 2000);
      },
      onError: (err) => {
        console.error("Profile update failed:", err);
      },
      onSettled: () => {
        setIsProfileUpdating(false);
      },
    });
  };

  // --- MODIFIED: Update availability payload ---
  const handleUpdateAvailability = async (e) => {
    e.preventDefault();
    setIsAvailabilityUpdating(true);

    try {
      // Filter for entries that are explicitly marked as available
      const validAvailability = formData.availability.filter(
        (a) => a.isAvailable
      );

      const payload = {
        availability: validAvailability,
        absences: formData.absences,
      };

      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/carer/${user._id}/availability`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 201) {
        setSuccess("Availability updated successfully!");
        setTimeout(() => {
          setIsEditMode(false);
          setSuccess("");
        }, 1000);
      } else {
        setSuccess("");
        console.error("Failed to update availability:", res.data);
      }
    } catch (err) {
      console.error("Request failed:", err);
      setSuccess("");
    } finally {
      setIsAvailabilityUpdating(false);
    }
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Header />
        <div className="w-full h-[85vh] flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4">
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
            <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
              Loading profile...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header section */}
          <div className="mb-6 flex items-center">
            <button
              onClick={handleGoBack}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <span className="text-slate-600 dark:text-slate-300">
                <BackIcon />
              </span>
            </button>
            <div className="ml-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
                My Profile
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
                View and manage your personal information.
              </p>
            </div>
          </div>

          {/* Success/Error Messages */}
          {isError && (
            <p className="text-red-500 dark:text-red-400 text-sm text-center mb-4">
              {error.message}
            </p>
          )}
          {success && (
            <p className="text-green-600 dark:text-green-400 text-sm text-center mb-4">
              {success}
            </p>
          )}

          <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-8 rounded-xl shadow-sm">
            {/* Personal Info Section */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative flex-shrink-0">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="User Avatar"
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-md"
                  />
                ) : (
                  <span className="flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 text-3xl font-bold text-white capitalize rounded-full object-cover border-4 border-white dark:border-slate-700 bg-[#E5447D] shadow-md">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "M"}
                  </span>
                )}
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="absolute bottom-1 right-1 bg-white dark:bg-slate-600 p-2 rounded-full text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-500 shadow-md transition-colors"
                  >
                    <CameraIcon />
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="w-full mt-4 md:mt-0">
                {!isEditMode ? (
                  // DISPLAY MODE
                  <div className="w-full text-center md:text-left">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
                          {user.name}
                        </h2>
                        <p className="text-md text-slate-500 dark:text-slate-400 capitalize">
                          {user.role}
                        </p>
                      </div>
                      <button
                        onClick={() => setIsEditMode(true)}
                        className="mt-4 md:mt-0 text-sm font-semibold text-[#FE4982] hover:underline"
                      >
                        Edit Profile
                      </button>
                    </div>
                    <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-6">
                      <dl className="grid grid-cols-1 gap-y-4">
                        <div>
                          <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Email address
                          </dt>
                          <dd className="mt-1 text-md text-slate-900 dark:text-slate-200">
                            {user.email}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                ) : (
                  // EDIT MODE
                  <form onSubmit={handleUpdateProfile} className="w-full">
                    <div className="space-y-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >
                          Full Name
                        </label>
                        <div className="relative">
                          <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                            <UserIcon />
                          </span>
                          <input
                            id="name"
                            name="name"
                            value={formData.name || ""}
                            onChange={handleFormChange}
                            className="w-full pl-10 pr-4 py-3 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                      <button
                        type="submit"
                        onClick={handleUpdateProfile}
                        disabled={isProfileUpdating}
                        className="w-full sm:w-auto bg-[#FE4982] text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-[#E03A6D] transition-all disabled:bg-opacity-60"
                      >
                        {isProfileUpdating ? (
                          "Saving..."
                        ) : (
                          <>
                            <SaveIcon /> Update Profile
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* CAREGIVER-ONLY SECTION */}
            {user.role === "caregiver" && (
              <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
                {!isEditMode ? (
                  // CAREGIVER DISPLAY MODE
                  <>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
                        Weekly Availability
                      </h3>
                      {formData.availability &&
                      formData.availability.length > 0 ? (
                        <ul className="space-y-2">
                          {DAYS_OF_WEEK.map((day) => {
                            const avail = formData.availability.find(
                              (a) => a.day === day
                            );
                            return (
                              <li
                                key={day}
                                className="flex justify-between items-center bg-slate-100 dark:bg-slate-700/50 p-3 rounded-md"
                              >
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                  {day}
                                </span>
                                {avail && avail.isAvailable ? (
                                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                    Available
                                  </span>
                                ) : (
                                  <span className="text-sm text-slate-500 dark:text-slate-400">
                                    Unavailable
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="text-slate-500 dark:text-slate-400">
                          No availability set.
                        </p>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
                        Planned Absences
                      </h3>
                      {formData.absences && formData.absences.length > 0 ? (
                        <ul className="space-y-2">
                          {formData.absences.map((absence, index) => (
                            <li
                              key={index}
                              className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-md"
                            >
                              <p className="font-medium text-slate-700 dark:text-slate-300">
                                {new Date(absence.date).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {absence.reason}
                              </p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-500 dark:text-slate-400">
                          No absences planned.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  // CAREGIVER EDIT MODE with Checkbox
                  <form onSubmit={handleUpdateAvailability}>
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                        Set Weekly Availability
                      </h3>
                      <div className="space-y-4">
                        {DAYS_OF_WEEK.map((day) => {
                          const dayAvailability = formData.availability?.find(
                            (d) => d.day === day
                          );
                          const isAvailable =
                            dayAvailability?.isAvailable || false;

                          return (
                            <div
                              key={day}
                              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                            >
                              <div>
                                <label className="font-medium text-slate-700 dark:text-slate-300">
                                  {day}
                                </label>
                                <span className="block text-sm text-slate-500 dark:text-slate-400 font-normal">
                                  {weekDates[day]}
                                </span>
                              </div>
                              <label
                                htmlFor={`available-${day}`}
                                className="relative inline-flex items-center cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  id={`available-${day}`}
                                  className="sr-only peer"
                                  checked={isAvailable}
                                  onChange={(e) =>
                                    handleAvailabilityChange(
                                      day,
                                      weekDates[day],
                                      e.target.checked
                                    )
                                  }
                                />
                                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-pink-400 dark:peer-focus:ring-pink-500 peer-checked:after:translate-x-1/2 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-[#FE4982]"></div>
                                <span
                                  className={`inline-block ${
                                    isAvailable ? "pl-7" : "pl-3"
                                  } text-sm font-medium text-slate-700 dark:text-slate-300`}
                                >
                                  {isAvailable ? "Available" : "Unavailable"}
                                </span>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Edit Absences */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                          Manage Absences
                        </h3>
                        <button
                          type="button"
                          onClick={handleAddAbsence}
                          className="text-sm font-semibold text-[#FE4982] hover:underline"
                        >
                          + Add Absence
                        </button>
                      </div>
                      <div className="space-y-4">
                        {formData.absences?.map((absence, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center"
                          >
                            <input
                              type="date"
                              value={
                                absence.date
                                  ? new Date(absence.date)
                                      .toISOString()
                                      .split("T")[0]
                                  : ""
                              }
                              onChange={(e) =>
                                handleAbsenceChange(
                                  index,
                                  "date",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FE4982]"
                            />
                            <div className="relative sm:col-span-2 flex items-center">
                              <input
                                type="text"
                                placeholder="Reason for absence"
                                value={absence.reason}
                                onChange={(e) =>
                                  handleAbsenceChange(
                                    index,
                                    "reason",
                                    e.target.value
                                  )
                                }
                                className="w-full pl-3 pr-10 py-2 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FE4982]"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveAbsence(index)}
                                className="absolute right-2 text-slate-500 hover:text-red-500"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                      <button
                        type="submit"
                        onClick={handleUpdateAvailability}
                        disabled={isAvailabilityUpdating}
                        className="w-full sm:w-auto bg-[#FE4982] text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-[#E03A6D] transition-all disabled:bg-opacity-60"
                      >
                        {isAvailabilityUpdating ? (
                          "Saving..."
                        ) : (
                          <>
                            <SaveIcon /> Update Availability
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* General Cancel Button */}
            {isEditMode && (
              <div className="flex flex-col sm:flex-row justify-end gap-4 border-t border-slate-100 dark:border-slate-700 pt-6 mt-8">
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className="w-full sm:w-auto bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
