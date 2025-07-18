import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useParams, NavLink } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useUser } from "../hooks/useUser";
import { ConfirmationModal } from "../components/ConfirmationModal";
import {
  getPatient,
  deletePatient,
  updatePatient,
  getCaregivers,
} from "../services/patient";
import {
  UserIcon,
  ActivityIcon,
  HashIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  SaveIcon,
  BackIcon,
  TrashIcon,
  AlertTriangleIcon,
} from "../Icons";

const getCarers = async (token) => {
  try {
    const res = await getCaregivers(token);

    return res.data; // Return caregiver data
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error("No caregivers found.");
    }
    throw new Error("Unable to fetch caregivers. Please try again later.");
  }
};
const FormSkeleton = () => (
  <div className="animate-pulse max-w-4xl mx-auto">
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-sm">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
        <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
        <div className="w-full space-y-3 pt-2">
          <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div className="h-5 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div className="h-48 bg-white dark:bg-slate-800 rounded-xl shadow-sm"></div>
      <div className="h-48 bg-white dark:bg-slate-800 rounded-xl shadow-sm"></div>
    </div>
    <div className="h-32 mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm"></div>
  </div>
);

// --- Edit Patient Page Component ---
export default function PatientEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    diagnosis: "",
    address: { street: "", city: "", state: "", postalCode: "", country: "" },
    notes: "",
    assignedCaregiver: null,
    invoices: [],
  });

  document.title = `Edit ${
    formData ? formData.name : ""
  } Service User | Care Management System`;

  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { userQuery } = useUser();
  const { data: user } = userQuery;
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal
  const token = localStorage.getItem("token");
  const modalRef = useRef(null); // Ref for modal element

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  useEffect(() => {
    if (!id || !token) {
      navigate("/login");
      return;
    }
    const fetchCaregivers = async () => {
      try {
        const data = await getCarers(token);
        setCaregivers(data);
        setError("");
      } catch (err) {
        setError(err.message || "Something went wrong.");
      }
    };

    const fetchPatient = async () => {
      try {
        setLoading(true);
        const response = await getPatient(id, token);
        const patientData = response.data;
        setFormData({
          ...patientData,
          assignedCaregiver:
            patientData.assignedCaregiver?._id ||
            patientData.assignedCaregiver ||
            "",
        });
      } catch (error) {
        console.error("Error fetching service user data:", error);
        navigate("/patients");
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchPatient();
    } else {
      navigate("/patients");
    }
    fetchCaregivers();
  }, [id, token, navigate]);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isModalOpen &&
        modalRef.current &&
        !modalRef.current.contains(e.target)
      ) {
        setIsModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleAddressChange = (e) =>
    setFormData({
      ...formData,
      address: { ...formData.address, [e.target.name]: e.target.value },
    });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const dataToUpdate = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "address") {
        Object.keys(formData.address).forEach((addrKey) => {
          dataToUpdate.append(`address[${addrKey}]`, formData.address[addrKey]);
        });
      } else {
        dataToUpdate.append(key, formData[key]);
      }
    });

    try {
      await updatePatient(id, dataToUpdate, token);
      setSuccess("Service updated successfully!");
      setTimeout(() => navigate(`/patients/${id}`), 1000);
    } catch (err) {
      // Check for error response from server
      const errorMessage =
        err?.response?.data?.message || "Failed to update profile.";
      setError(errorMessage); // Set the error message from the server (if any)

      // Optionally log the error for debugging
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false); // Ensure loading state is reset
    }
  };

  const confirmDelete = async () => {
    setIsModalOpen(false); // Close modal first
    setLoading(true); // Set loading state
    setError(""); // Reset error state
    setSuccess(""); // Reset success state

    try {
      // Attempt to delete the patient
      await deletePatient(id, token);

      // On success, set the success message
      setSuccess("Service User deleted successfully!");

      // Redirect after a short delay
      setTimeout(() => navigate("/patients"), 1500);
    } catch (err) {
      // Check if there is an error message from the backend
      const errorMessage =
        err?.response?.data?.message || "Failed to delete service user.";

      // Set the error state
      setError(errorMessage);

      // Optionally, log the error for debugging
      console.error("Error deleting service user:", err);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  if (!formData.name)
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="flex-grow container mx-auto p-8">
          <FormSkeleton />
        </main>
        <Footer />
      </div>
    );

  const handleGoBack = () => {
    if (window.history.state && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/patients");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* RESPONSIVE: Header now stacks on mobile for better visibility */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
            <div className="flex items-center">
              <button
                onClick={handleGoBack}
                className="mr-4 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <span className="text-slate-600 dark:text-slate-300">
                  <BackIcon />
                </span>
              </button>
              <div>
                {/* RESPONSIVE: Title font size adjusts for smaller screens */}
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
                  Edit Service User Profile
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Update {formData.name}'s information below.
                </p>
              </div>
            </div>
            {user && user.role === "admin" && (
              <button
                onClick={() => setIsModalOpen(true)} // Open modal on click
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center sm:justify-start gap-2 disabled:bg-opacity-60"
              >
                <TrashIcon />
                Delete
              </button>
            )}
          </div>
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-sm space-y-8"
          >
            {/* RESPONSIVE: Avatar container centers avatar on mobile */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* RESPONSIVE: Avatar size and font are adjusted for mobile */}
              <span className=" flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 text-4xl sm:text-5xl font-bold text-white capitalize rounded-full object-cover border-4 border-white dark:border-slate-700 bg-[#E5447D] shadow-md ">
                {formData.name ? formData.name.charAt(0).toUpperCase() : "M"}
              </span>
            </div>

            <fieldset className="space-y-6">
              <legend className="text-lg font-semibold text-[#1D2056] dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
                Personal & Contact
              </legend>
              {/* NOTE: The grid system below is already responsive and works well. */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="age"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Age
                  </label>
                  <div className="relative">
                    <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                      <HashIcon />
                    </span>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full pl-4 pr-10 py-3 appearance-none bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                      <svg
                        className="w-5 h-5"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Phone
                  </label>
                  <div className="relative">
                    <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                      <PhoneIcon />
                    </span>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                      <MailIcon />
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-6">
              <legend className="text-lg font-semibold text-[#1D2056] dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
                Address
              </legend>
              <div>
                <label
                  htmlFor="street"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Street Address
                </label>
                <div className="relative">
                  <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                    <MapPinIcon />
                  </span>
                  <input
                    id="street"
                    name="street"
                    value={formData?.address?.street}
                    onChange={handleAddressChange}
                    className="w-full pl-10 pr-4 py-3 text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    value={formData?.address?.city}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 bg-slate-100 text-slate-800 dark:text-slate-200 dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    State / Province
                  </label>
                  <input
                    id="state"
                    name="state"
                    value={formData?.address?.state}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 bg-slate-100 text-slate-800 dark:text-slate-200 dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="postalCode"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Postal Code
                  </label>
                  <input
                    id="postalCode"
                    name="postalCode"
                    value={formData?.address?.postalCode}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 bg-slate-100 text-slate-800 dark:text-slate-200 dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Country
                  </label>
                  <input
                    id="country"
                    name="country"
                    value={formData?.address?.country}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 bg-slate-100 text-slate-800 dark:text-slate-200 dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-6">
              <legend className="text-lg font-semibold text-[#1D2056] dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
                Medical & Admin
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="diagnosis"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Primary Diagnosis
                  </label>
                  <div className="relative">
                    <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                      <ActivityIcon />
                    </span>
                    <input
                      id="diagnosis"
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="assignedCaregiver"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Assigned Caregiver
                  </label>
                  <div className="relative">
                    <select
                      id="assignedCaregiver"
                      name="assignedCaregiver"
                      value={formData.assignedCaregiver}
                      onChange={handleChange}
                      className="w-full p-3 bg-slate-100 text-slate-800 dark:text-slate-200 dark:bg-slate-700 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                    >
                      <option value="" disabled>
                        Select a caregiver
                      </option>
                      {caregivers.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                      <svg
                        className="w-5 h-5"
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
              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Any relevant notes about the service user's condition or preferences."
                  className="w-full px-4 py-3 bg-slate-100 text-slate-800 dark:text-slate-200 dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                ></textarea>
              </div>
            </fieldset>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              {error && (
                <p className="text-red-500 dark:text-red-400 text-sm text-center">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-green-600 dark:text-green-400 text-sm text-center">
                  {success}
                </p>
              )}
              {/* RESPONSIVE: Button container stacks on mobile. col-reverse is for better UX on mobile. */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate(`/patients/${id}`)}
                  className="w-full sm:w-auto justify-center bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-[#FE4982] text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-[#E03A6D] disabled:bg-opacity-60"
                >
                  {loading && !success ? (
                    "Saving..."
                  ) : (
                    <>
                      <SaveIcon /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Service User"
        modalRef={modalRef}
      >
        <p>
          Are you sure you want to delete this service user? This action cannot
          be undone and will permanently remove their data.
        </p>
      </ConfirmationModal>
      <Footer />
    </div>
  );
}
