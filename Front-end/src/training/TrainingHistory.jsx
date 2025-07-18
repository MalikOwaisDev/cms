import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getHistory } from "../services/training";
import { useUser } from "../hooks/useUser";
import {
  CheckCircleIcon,
  PlusIcon,
  ArchiveIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  BackIcon,
} from "../Icons";

// --- RESPONSIVE Loading Skeleton for the new table layout ---
const ListSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between"
      >
        {/* Mobile skeleton */}
        <div className="w-full sm:hidden space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
        </div>
        {/* Desktop skeleton */}
        <div className="hidden sm:flex items-center space-x-4 w-1/2">
          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        </div>
        <div className="hidden sm:block h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
        <div className="hidden sm:block h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
      </div>
    ))}
  </div>
);

// --- Training History Page ---
export default function TrainingHistory() {
  document.title = "Training History | Care Management System";
  const [historyLog, setHistoryLog] = useState([]);
  const [filteredLog, setFilteredLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { userQuery } = useUser();
  const { data: user } = userQuery;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const itemsPerPage = 10;

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!user) return; // Wait for user data to be available

    const fetchHistory = async () => {
      try {
        const res = await getHistory(token);
        const log = [];
        res.data.forEach((training) => {
          if (training.status === "completed" && training.training.assignedTo) {
            training.training.assignedTo.forEach((caregiver) => {
              log.push({
                logId: `${training.training._id}-${caregiver._id}`,
                title: training.training.title,
                caregiverId: caregiver._id,
                caregiverName: caregiver.name,
                dateCompleted: training.dateCompleted,
              });
            });
          }
        });

        log.sort(
          (a, b) => new Date(b.dateCompleted) - new Date(a.dateCompleted)
        );

        if (user?.role === "caregiver") {
          const caregiverLog = log.filter(
            (item) => item.caregiverId === user?._id
          );
          setHistoryLog(caregiverLog);
          setFilteredLog(caregiverLog);
        } else {
          setHistoryLog(log);
          setFilteredLog(log);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [token, navigate, user]);

  useEffect(() => {
    const results = historyLog.filter(
      (log) =>
        log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user?.role !== "caregiver" &&
          log.caregiverName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredLog(results);
    setCurrentPage(1);
  }, [searchTerm, historyLog, user]);

  const totalPages = Math.ceil(filteredLog.length / itemsPerPage);
  const currentItems = filteredLog.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pageTitle =
    user?.role === "caregiver" ? "My Completed Trainings" : "Training History";
  const pageSubtitle =
    user?.role === "caregiver"
      ? "A record of all your completed training modules."
      : "A log of all completed training modules by caregivers.";
  const searchPlaceholder =
    user?.role === "caregiver"
      ? "Search by training title..."
      : "Search by training or caregiver...";

  const handleGoBack = () => {
    if (window.history.state && window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/trainings");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
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
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                {pageTitle}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-base sm:text-lg">
                {pageSubtitle}
              </p>
            </div>
          </div>
          {user?.role === "admin" && (
            <Link
              to="/trainings/new"
              className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 bg-[#FE4982] text-white font-bold py-2.5 px-5 rounded-lg hover:bg-[#E03A6D] transition-all shadow-md hover:shadow-lg"
            >
              <PlusIcon /> Create Training
            </Link>
          )}
        </div>

        <div className="mb-6">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-x-auto">
          {loading ? (
            <div className="p-4">
              <ListSkeleton />
            </div>
          ) : currentItems.length > 0 ? (
            <>
              <table className="w-full text-sm text-left">
                {/* --- The 'sm:table-header-group' class makes this header appear only on desktop --- */}
                <thead className="hidden sm:table-header-group bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 w-1/2">
                      Training Module
                    </th>
                    {user?.role === "admin" && (
                      <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">
                        Caregiver
                      </th>
                    )}
                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-right">
                      Date Completed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((log) => (
                    // --- Each TR is a card on mobile, a row on desktop ---
                    <tr
                      key={log.logId}
                      className="block sm:table-row mb-4 sm:mb-0 border sm:border-0 rounded-lg sm:rounded-none border-slate-200 dark:border-slate-700"
                    >
                      {/* --- For each TD, data-label provides the mobile header --- */}
                      <td
                        data-label="Training Module"
                        className="flex items-center justify-between sm:table-cell p-3 sm:p-4 border-b sm:border-none border-slate-200 dark:border-slate-700"
                      >
                        <span className="font-semibold text-slate-500 dark:text-slate-400 sm:hidden">
                          Training Module
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-green-500">
                            <CheckCircleIcon size={20} />
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-right sm:text-left">
                            {log.title}
                          </span>
                        </div>
                      </td>

                      {user?.role === "admin" && (
                        <td
                          data-label="Caregiver"
                          className="flex items-center justify-between sm:table-cell p-3 sm:p-4 border-b sm:border-none border-slate-200 dark:border-slate-700"
                        >
                          <span className="font-semibold text-slate-500 dark:text-slate-400 sm:hidden">
                            Caregiver
                          </span>
                          <span className="text-slate-600 dark:text-slate-300">
                            {log.caregiverName}
                          </span>
                        </td>
                      )}

                      <td
                        data-label="Date Completed"
                        className="flex items-center justify-between sm:table-cell p-3 sm:p-4 text-right"
                      >
                        <span className="font-semibold text-slate-500 dark:text-slate-400 sm:hidden">
                          Date Completed
                        </span>
                        <span className="text-slate-600 dark:text-slate-300">
                          {new Date(log.dateCompleted).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-4 gap-4 border-t border-slate-100 dark:border-slate-700/50">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Showing{" "}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>
                    -
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {Math.min(currentPage * itemsPerPage, filteredLog.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {filteredLog.length}
                    </span>{" "}
                    results
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon /> Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next <ChevronRightIcon size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col text-center py-16 px-4">
              <span className="mx-auto text-slate-400 dark:text-slate-500">
                <ArchiveIcon size={40} />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-200">
                No Completed Trainings Found
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {searchTerm
                  ? `No records match your search for "${searchTerm}".`
                  : "Completed training records will appear here."}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
