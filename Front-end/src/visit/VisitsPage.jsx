import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import Spinner from "../components/Spinner";
import "../DatePicker.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DateFilter from "../components/DateFilter";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { PlusIcon, SearchIcon, TrashIcon, BackIcon } from "../Icons";
import { getVisits, deleteVisit } from "../services/visit";

// Component for the status badge
const StatusBadge = ({ status }) => {
  const baseClasses =
    "px-3 py-1 text-xs font-semibold rounded-full capitalize whitespace-nowrap";
  let statusClasses = "";

  switch (status) {
    case "scheduled":
      statusClasses =
        "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300";
      break;
    case "completed":
      statusClasses =
        "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      break;
    case "in_progress":
      statusClasses =
        "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
      break;
    default:
      statusClasses =
        "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
  }

  return (
    <span className={`${baseClasses} ${statusClasses}`}>
      {status.replace("_", " ")}
    </span>
  );
};

export default function VisitsPage() {
  document.title = "Manage Visits | Care Management System";
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // State management
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("scheduled");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // State for search, sort, modal, and date filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [sortOption, setSortOption] = useState("date-desc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState(null);

  const fetchVisits = async () => {
    setLoading(true); // Start loading state
    setError(""); // Clear previous errors

    try {
      const res = await getVisits(token); // Make the API call
      setVisits(res.data.visits || []); // Set visits data, defaulting to an empty array if not available
    } catch (err) {
      // Log error for debugging
      console.error("Error fetching visits:", err);

      // Check for specific error message from the response
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Could not load visits. Please refresh the page."; // Fallback message

      // Set error state with the specific message
      setError(errorMessage);
    } finally {
      setLoading(false); // End loading state
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchVisits();
  }, [token, navigate]);

  const handleDeleteRequest = (visit) => {
    setVisitToDelete(visit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setVisitToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!visitToDelete) return;

    try {
      await deleteVisit(visitToDelete._id, token);
      fetchVisits();
    } catch (err) {
      setError("Failed to delete the visit. Please try again.");
      console.error("Delete error:", err);
    } finally {
      handleCloseModal();
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (timeString) =>
    new Date(`1970-01-01T${timeString}Z`).toLocaleTimeString(
      {},
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );

  const processedVisits = useMemo(() => {
    let filtered = visits;
    // ... filtering and sorting logic remains exactly the same
    if (activeTab === "completed") {
      filtered = filtered.filter((visit) => visit.status === "completed");
    } else {
      filtered = filtered.filter(
        (visit) =>
          visit.status === "scheduled" || visit.status === "in_progress"
      );
    }
    if (selectedDate) {
      filtered = filtered.filter((visit) => {
        const visitDate = new Date(visit.date);
        return (
          visitDate.getFullYear() === selectedDate.getFullYear() &&
          visitDate.getMonth() === selectedDate.getMonth() &&
          visitDate.getDate() === selectedDate.getDate()
        );
      });
    }
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((visit) => {
        const patientName = visit.patient?.name?.toLowerCase() || "";
        const caregiverName = visit.caregiver?.name?.toLowerCase() || "";
        const visitDate = formatDate(visit.date).toLowerCase();
        return (
          patientName.includes(lowercasedQuery) ||
          caregiverName.includes(lowercasedQuery) ||
          visitDate.includes(lowercasedQuery)
        );
      });
    }
    filtered.sort((a, b) => {
      switch (sortOption) {
        case "date-asc":
          return new Date(a.date) - new Date(b.date);
        case "patient-asc":
          return (a.patient?.name || "").localeCompare(b.patient?.name || "");
        case "patient-desc":
          return (b.patient?.name || "").localeCompare(a.patient?.name || "");
        case "date-desc":
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });
    return filtered;
  }, [visits, activeTab, searchQuery, selectedDate, sortOption]);

  const totalPages = Math.ceil(processedVisits.length / ITEMS_PER_PAGE);
  const paginatedVisits = processedVisits.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleGoBack = () => {
    if (window.history.state && window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  // NEW: Handler to connect the DateFilter component to the page's state
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setCurrentPage(1); // Reset pagination when date filter changes
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-sans">
        <Header />
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-8xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
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
                    Manage Visits
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    View, track, and schedule all service user visits.
                  </p>
                </div>
              </div>
              <Link
                to="/visits/create"
                className="w-full md:w-auto bg-[#FE4982] text-white font-bold py-3 px-5 rounded-lg flex items-center justify-center gap-2 hover:bg-[#E03A6D] transition-colors"
              >
                <PlusIcon />
                Schedule New Visit
              </Link>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
              <nav className="flex space-x-4" aria-label="Tabs">
                <button
                  onClick={() => handleTabClick("scheduled")}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === "scheduled"
                      ? "border-b-2 border-[#FE4982] text-[#FE4982]"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Scheduled & In Progress
                </button>
                <button
                  onClick={() => handleTabClick("completed")}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === "completed"
                      ? "border-b-2 border-[#FE4982] text-[#FE4982]"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Completed
                </button>
              </nav>
            </div>

            {/* Search, Date Filter, and Sort Controls */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
              <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  placeholder="Search by service user or caregiver..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                />
              </div>

              {/* REPLACED with the new component */}
              <DateFilter
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                className="lg:w-48"
              />

              <div className="flex-shrink-0 relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full lg:w-auto h-full appearance-none pr-10 px-4 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                >
                  <option value="date-desc">Sort by Date (Newest)</option>
                  <option value="date-asc">Sort by Date (Oldest)</option>
                  <option value="patient-asc">
                    Sort by Service User (A-Z)
                  </option>
                  <option value="patient-desc">
                    Sort by Service User (Z-A)
                  </option>
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

            {/* --- Responsive Visits Display (No changes here) --- */}
            <div>
              {loading ? (
                <Spinner />
              ) : error ? (
                <div className="text-center p-8 text-red-500 bg-red-100 dark:bg-red-900/50 rounded-lg">
                  {" "}
                  {error}{" "}
                </div>
              ) : paginatedVisits.length > 0 ? (
                <>
                  <div className="hidden md:block bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                      <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                          <th scope="col" className="px-6 py-3">
                            Service User
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Caregiver
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Time
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedVisits.map((visit) => (
                          <tr
                            key={visit._id}
                            className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                          >
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                              {visit.patient?.name || "N/A"}
                            </td>
                            <td className="px-6 py-4">
                              {visit.caregiver?.name || "N/A"}
                            </td>
                            <td className="px-6 py-4">
                              {formatDate(visit.date)}
                            </td>
                            <td className="px-6 py-4">{`${formatTime(
                              visit.startTime
                            )} - ${formatTime(visit.endTime)}`}</td>
                            <td className="px-6 py-4">
                              <StatusBadge status={visit.status} />
                            </td>
                            <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                              <Link
                                to={`/visits/view/${visit._id}`}
                                className="font-medium text-[#FE4982] hover:underline"
                              >
                                View
                              </Link>
                              <button
                                onClick={() => handleDeleteRequest(visit)}
                                className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:hidden">
                    {paginatedVisits.map((visit) => (
                      <div
                        key={visit._id}
                        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-base text-slate-900 dark:text-white pr-2">
                            {visit.patient?.name || "N/A"}
                          </h3>
                          <StatusBadge status={visit.status} />
                        </div>
                        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-3">
                          <p>
                            <strong>Caregiver:</strong>{" "}
                            {visit.caregiver?.name || "N/A"}
                          </p>
                          <p>
                            <strong>Date:</strong> {formatDate(visit.date)}
                          </p>
                          <p>
                            <strong>Time:</strong>{" "}
                            {`${formatTime(visit.startTime)} - ${formatTime(
                              visit.endTime
                            )}`}
                          </p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end items-center gap-4">
                          <Link
                            to={`/visits/view/${visit._id}`}
                            className="font-medium text-[#FE4982] hover:underline"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => handleDeleteRequest(visit)}
                            className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                  {" "}
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    No Visits Found
                  </h3>{" "}
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Try adjusting your search or selected date.
                  </p>{" "}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center justify-between gap-4 mt-8 sm:flex-row sm:gap-0">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Confirm Visit Deletion"
      >
        Are you sure you want to delete the visit for{" "}
        <span className="font-bold">{visitToDelete?.patient?.name}</span> on{" "}
        <span className="font-bold">
          {visitToDelete ? formatDate(visitToDelete.date) : ""}
        </span>
        ? This action cannot be undone.
      </ConfirmationModal>
    </>
  );
}
