import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getPatients, deletePatient } from "../services/patient";
import { useUser } from "../hooks/useUser";
import { ConfirmationModal } from "../components/ConfirmationModal";
import {
  PlusIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  UserGroupIcon,
  TrashIcon,
  BackIcon,
} from "../Icons";

// --- Loading Skeleton for Patient List ---
const TableSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="h-auto sm:h-20 bg-white dark:bg-slate-800/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
      >
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          <div className="flex-1 space-y-3 sm:hidden">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2"></div>
          </div>
        </div>
        <div className="hidden sm:block flex-1 space-y-3">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2"></div>
        </div>
        <div className="w-1/4 h-5 bg-slate-200 dark:bg-slate-700 rounded-md hidden sm:block"></div>
        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full self-end sm:self-auto"></div>
      </div>
    ))}
  </div>
);

// --- Patient List Page Component ---
export default function ListPatients() {
  document.title = "Service Users | Care Management System";
  const modalRef = useRef(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userQuery } = useUser();
  const { data: user } = userQuery;
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const itemsPerPage = 10;

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        const patientsRes = await getPatients(token);
        setPatients(patientsRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, navigate]);

  const handleDeleteClick = (patientId) => {
    setPatientToDelete(patientId);
    setIsModalOpen(true);
  };

  const handleGoBack = () => {
    if (window.history.state && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const confirmDelete = async () => {
    if (!patientToDelete) return;
    try {
      await deletePatient(patientToDelete, token);
      const updatedPatients = patients.filter((p) => p._id !== patientToDelete);
      setPatients(updatedPatients);

      const newTotalPages = Math.ceil(updatedPatients.length / itemsPerPage);
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages || 1);
      }

      setSuccess("Service User deleted successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to delete Service user:", err);
      setError("Failed to delete service user.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsModalOpen(false);
      setPatientToDelete(null);
    }
  };

  const Avatar = ({ name }) => {
    const colors = [
      "bg-pink-200 text-pink-800",
      "bg-purple-200 text-purple-800",
      "bg-blue-200 text-blue-800",
      "bg-green-200 text-green-800",
      "bg-yellow-200 text-yellow-800",
      "bg-indigo-200 text-indigo-800",
    ];
    const color = colors[name.charCodeAt(0) % colors.length];
    return (
      <div
        className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg ${color}`}
      >
        {name ? name.charAt(0).toUpperCase() : "?"}
      </div>
    );
  };

  // --- Pagination Logic ---
  const totalPages = Math.ceil(patients.length / itemsPerPage);
  const indexOfLastPatient = currentPage * itemsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - itemsPerPage;
  const currentPatients = patients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans">
      <Header />

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center mb-8">
          <button
            onClick={handleGoBack}
            className="mr-4 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <span className="text-slate-600 dark:text-slate-300">
              <BackIcon />
            </span>
          </button>
          <div className="flex-grow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
                Service Users
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 text-base sm:text-lg">
                {user && user.role === "admin"
                  ? "A comprehensive list of all registered service users."
                  : "View Your Parents"}
              </p>
            </div>
            {user && user.role === "admin" && (
              <Link
                to="/patients/new"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FE4982] text-white font-bold py-2.5 px-5 rounded-lg hover:bg-[#E03A6D] transition-all"
              >
                <PlusIcon /> Add New Service User
              </Link>
            )}
          </div>
        </div>

        {success && (
          <div className="mb-4 text-center p-3 rounded-lg bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 text-center p-3 rounded-lg bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm">
          {loading ? (
            <div className="p-4">
              <TableSkeleton />
            </div>
          ) : patients.length > 0 ? (
            <div>
              {/* --- Table Headers --- */}
              <div className="hidden sm:grid grid-cols-[minmax(0,_3fr)_minmax(0,_2fr)_minmax(0,_1fr)_minmax(0,_2fr)_auto] items-center gap-x-6 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <div className="font-semibold text-sm text-slate-600 dark:text-slate-300">
                  Service User
                </div>
                <div className="font-semibold text-sm text-slate-600 dark:text-slate-300">
                  Diagnosis
                </div>
                <div className="font-semibold text-sm text-slate-600 dark:text-slate-300">
                  Age
                </div>
                <div className="font-semibold text-sm text-slate-600 dark:text-slate-300">
                  Last Visit
                </div>
                <div className="font-semibold text-sm text-slate-600 dark:text-slate-300 text-right">
                  Actions
                </div>
              </div>

              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {currentPatients.map((p) => (
                  <div
                    key={p._id}
                    className="grid grid-cols-1 sm:grid-cols-[minmax(0,_3fr)_minmax(0,_2fr)_minmax(0,_1fr)_minmax(0,_2fr)_auto] items-center gap-x-6 px-4 sm:px-6 py-4 group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                  >
                    {/* --- Patient Name and Avatar --- */}
                    <div className="flex items-center gap-4">
                      <Avatar name={p.name} />
                      <div className="flex-grow">
                        <Link
                          to={`/patients/${p.pID}`}
                          className="font-bold text-md text-slate-800 dark:text-slate-100 hover:text-[#FE4982] dark:hover:text-[#FE4982] transition-colors"
                        >
                          {p.name}
                        </Link>
                        {/* Diagnosis shown under name on mobile */}
                        <div className="text-sm text-slate-500 dark:text-slate-400 sm:hidden mt-1">
                          {p.diagnosis}
                        </div>
                      </div>
                    </div>

                    {/* --- Other details (Desktop only) --- */}
                    <div className="hidden sm:block text-slate-600 dark:text-slate-300">
                      {p.diagnosis}
                    </div>
                    <div className="hidden sm:block text-slate-600 dark:text-slate-300">
                      {p.age} years
                    </div>
                    <div className="hidden sm:block text-slate-600 dark:text-slate-300">
                      {new Date(p.lastVisit).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>

                    {/* --- Action Buttons --- */}
                    <div className="hidden sm:flex items-center justify-end gap-2 ml-auto sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      {user.role === "admin" && (
                        <button
                          onClick={() => handleDeleteClick(p._id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 p-2 rounded-full hover:bg-red-100 dark:hover:bg-slate-700"
                          title="Delete Service User"
                        >
                          <TrashIcon size={18} />
                        </button>
                      )}
                      <Link
                        to={`/patients/${p.pID}`}
                        className="text-slate-500 hover:text-[#FE4982] dark:text-slate-400 dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="View Details"
                      >
                        <ChevronRightIcon size={16} />
                      </Link>
                    </div>

                    {/* Action buttons for mobile view */}
                    <div className="sm:hidden flex justify-end gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      {user.role === "admin" && (
                        <button
                          onClick={() => handleDeleteClick(p._id)}
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 px-4 rounded-lg text-sm text-center"
                        >
                          Delete
                        </button>
                      )}
                      <Link
                        to={`/patients/${p.pID}`}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg text-sm text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* --- Pagination Controls --- */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-4 gap-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Showing{" "}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {indexOfFirstPatient + 1}
                    </span>
                    -
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {Math.min(indexOfLastPatient, patients.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {patients.length}
                    </span>{" "}
                    results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeftIcon /> Previous
                    </button>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next <ChevronRightIcon size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-24">
              <span className="inline-block mx-auto text-slate-400 dark:text-slate-500">
                <UserGroupIcon />
              </span>
              <h3 className="mt-6 text-2xl font-semibold text-slate-800 dark:text-slate-200">
                No Service User Found
              </h3>
              <p className="mt-2 text-md text-slate-500 dark:text-slate-400">
                Get started by adding a new service user to the system.
              </p>
            </div>
          )}
        </div>
      </main>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Service User Confirmation"
        modalRef={modalRef}
      >
        <p>
          Are you sure you want to delete this service user? This action is
          permanent and cannot be undone.
        </p>
      </ConfirmationModal>

      <Footer />
    </div>
  );
}
