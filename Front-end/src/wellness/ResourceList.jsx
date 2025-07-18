import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getResources, deleteResource } from "../services/wellness";
import { useUser } from "../hooks/useUser";
import {
  ExternalLinkIcon,
  BookHeartIcon,
  BackIcon,
  PlusIcon,
  TrashIcon,
} from "../Icons";

// --- Loading Skeleton ---
const CardSkeleton = () => (
  <div className="animate-pulse bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm space-y-4">
    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
    <div className="space-y-2 pt-2">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
    </div>
    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-32 mt-2 pt-2"></div>
  </div>
);

// --- RESPONSIVE Confirmation Dialog Component ---
const ConfirmationDialog = ({ onConfirm, onCancel }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => event.key === "Escape" && onCancel();
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        onCancel();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div
        ref={dialogRef}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-sm"
      >
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Confirm Deletion
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete this resource? This action cannot be
          undone.
        </p>
        <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto flex justify-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Wellness Resources Page ---
export default function ResourceList() {
  document.title = "Wellness Resources | Care Management System";
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const { userQuery } = useUser();
  const { data: user } = userQuery;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    getResources(token)
      .then((res) => setResources(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, navigate]);

  const handleDeleteClick = (id) => {
    setResourceToDelete(id);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    if (!resourceToDelete) return;
    try {
      await deleteResource(resourceToDelete, token);
      setResources((prev) =>
        prev.filter((res) => res._id !== resourceToDelete)
      );
    } catch (error) {
      console.error("Failed to delete resource:", error);
      alert("Failed to delete resource. Please try again.");
    } finally {
      setShowConfirmDialog(false);
      setResourceToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setResourceToDelete(null);
  };

  const CategoryBadge = ({ category }) => {
    const categoryStyles = {
      diet: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
      mental:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
      exercise:
        "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
      other:
        "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
    };
    return (
      <span
        className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
          categoryStyles[category] || categoryStyles.other
        }`}
      >
        {category}
      </span>
    );
  };

  const handleGoBack = () => {
    if (window.history.state && window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {/* --- RESPONSIVE Page Header --- */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div className="flex items-start gap-4">
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
                Wellness Resources
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                A curated library to support service user well-being.
              </p>
            </div>
          </div>
          {user?.role === "admin" && (
            <Link
              to="/wellness/resource/create"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FE4982] text-white font-bold py-2.5 px-4 rounded-lg hover:bg-[#E03A6D] transition-all flex-shrink-0"
            >
              <PlusIcon /> Create New
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [...Array(6)].map((_, i) => <CardSkeleton key={i} />)
          ) : resources.length > 0 ? (
            resources.map((res) => (
              <div
                key={res._id}
                className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div>
                  <div className="mb-3 w-full flex justify-between items-start">
                    <CategoryBadge category={res.category} />
                    {user?.role === "admin" && (
                      <button
                        onClick={() => handleDeleteClick(res._id)}
                        className="p-1.5 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40"
                        title="Delete Resource"
                      >
                        <TrashIcon size={18} />
                      </button>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-[#1D2056] dark:text-slate-100">
                    {res.title}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm flex-grow line-clamp-3">
                    {res.description}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <a
                    href={res.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#FE4982] hover:text-[#1D2056] dark:hover:text-pink-300 transition-colors"
                  >
                    Open Resource <ExternalLinkIcon />
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col text-center py-16 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
              <span className="mx-auto text-slate-400 dark:text-slate-500">
                <BookHeartIcon />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-200">
                No Resources Available
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Wellness resources will appear here when they are added.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {showConfirmDialog && (
        <ConfirmationDialog onConfirm={confirmDelete} onCancel={cancelDelete} />
      )}
    </div>
  );
}
