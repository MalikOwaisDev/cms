import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { getCaregivers, deleteCaregiver } from "../services/caregiver";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  UserIcon,
  MailIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  BackIcon,
  SearchIcon, // Assuming a search icon exists
  ExclamationIcon, // For the modal
} from "../Icons"; // Add required icons
import Spinner from "../components/Spinner";

// The list item remains unchanged
const CaregiverListItem = ({ caregiver, onDelete }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 md:flex md:items-center md:justify-between md:gap-4 transition-shadow hover:shadow-md">
    <div className="flex items-center gap-4 flex-grow">
      <div className="flex-shrink-0 w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
        {caregiver.avatar ? (
          <img
            src={caregiver.avatar}
            alt={caregiver.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="text-slate-500">
            <UserIcon />
          </span>
        )}
      </div>
      <div>
        <h3 className="font-bold text-slate-800 dark:text-slate-100">
          {caregiver.name}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {caregiver.email}
        </p>
      </div>
    </div>
    {/* Actions */}
    <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 md:mt-0 md:pt-0 md:border-t-0">
      <Link
        to={`/caregivers/view/${caregiver._id}`}
        className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
      >
        <EyeIcon />
      </Link>
      <Link
        to={`/caregivers/edit/${caregiver._id}`}
        className="p-2 text-slate-500 hover:text-green-600 dark:hover:text-green-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
      >
        <PencilIcon />
      </Link>
      <button
        onClick={() => onDelete(caregiver._id, caregiver.name)}
        className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
      >
        <TrashIcon />
      </button>
    </div>
  </div>
);

export default function ListCaregivers() {
  document.title = "All Caregivers | Care Management System";
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // New state for search, sort, and modal
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [caregiverToDelete, setCaregiverToDelete] = useState(null);

  const fetchCaregivers = useCallback(async () => {
    setLoading(true); // Show loading indicator
    try {
      const response = await getCaregivers(token); // Fetch caregivers from API
      setCaregivers(response.data); // Set fetched caregivers data
    } catch (err) {
      // If error response exists, get specific message, else use default
      const errorMessage =
        err?.response?.data?.message || "Could not load caregiver data.";
      setError(errorMessage); // Set the error message
    } finally {
      setLoading(false); // Hide loading indicator
    }
  }, [token]); // Memoize fetchCaregivers, depend on `token`

  // useEffect with `fetchCaregivers` memoized
  useEffect(() => {
    fetchCaregivers();
  }, [fetchCaregivers]); // Use memoized version as a dependency

  // Handler to open the modal
  const handleDeleteRequest = (id, name) => {
    setCaregiverToDelete({ id, name });
    setIsModalOpen(true);
  };

  // Handler to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCaregiverToDelete(null);
  };

  // Handler to confirm deletion and execute the API call
  const handleConfirmDelete = async () => {
    if (!caregiverToDelete) return;

    try {
      await deleteCaregiver(caregiverToDelete.id, token);
      // Refresh the list from the server to ensure consistency
      fetchCaregivers();
    } catch (err) {
      alert("Failed to delete caregiver.");
      console.error("Delete error:", err);
    } finally {
      handleCloseModal();
    }
  };
  const handleGoBack = () => {
    if (window.history.state && window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  // Filter and sort caregivers based on state
  const displayedCaregivers = useMemo(() => {
    let filtered = [...caregivers].filter(
      (cg) =>
        cg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cg.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (sortOption === "name-asc") {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });

    return filtered;
  }, [caregivers, searchQuery, sortOption]);

  return (
    <>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-sans">
        <Header />
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-8xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleGoBack}
                  className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 flex-shrink-0"
                >
                  <span className="text-slate-600 dark:text-slate-300">
                    <BackIcon />
                  </span>
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
                    Our Caregivers
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Manage all caregivers in the system.
                  </p>
                </div>
              </div>
              <Link
                to="/caregivers/create"
                className="mt-4 sm:mt-0 sm:w-fit w-full inline-flex items-center text-center justify-center gap-2 py-2 px-4 bg-[#FE4982] text-white font-semibold rounded-lg hover:bg-[#e63a6d] transition-colors"
              >
                <PlusIcon />
                Add New
              </Link>
            </div>

            {/* Search and Sort Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
              <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                />
              </div>
              <div className="flex-shrink-0 relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full md:w-auto appearance-none h-full px-4 py-2 pr-10 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                >
                  <option value="name-asc">Sort by Name (A-Z)</option>
                  <option value="name-desc">Sort by Name (Z-A)</option>
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

            {loading ? (
              <Spinner />
            ) : error ? (
              <div className="text-center text-red-500 bg-red-50 dark:bg-red-900/20 p-8 rounded-xl">
                <p>{error}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {displayedCaregivers.length > 0 ? (
                  displayedCaregivers.map((caregiver) => (
                    <CaregiverListItem
                      key={caregiver._id}
                      caregiver={caregiver}
                      onDelete={handleDeleteRequest} // Use the new handler
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                      No Caregivers Found
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                      Try adjusting your search or add a new caregiver.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>

      {/* Modal for Deletion Confirmation */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
      >
        Are you sure you want to delete{" "}
        <span className="font-bold">{caregiverToDelete?.name}</span>? This
        action cannot be undone.
      </ConfirmationModal>
    </>
  );
}
