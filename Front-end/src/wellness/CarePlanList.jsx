import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useUser } from "../hooks/useUser";
import {
  getCarePlans,
  updateGoalStatus,
  deleteCarePlan,
} from "../services/wellness";
import {
  PlusIcon,
  TargetIcon,
  ClipboardListIcon,
  BackIcon,
  EditIcon,
  TrashIcon,
} from "../Icons";

const CardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[...Array(2)].map((_, i) => (
      <div
        key={i}
        className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm"
      >
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
        <div className="space-y-3">
          <div className="h-10 bg-slate-100 dark:bg-slate-700/50 rounded-lg"></div>
          <div className="h-10 bg-slate-100 dark:bg-slate-700/50 rounded-lg"></div>
        </div>
      </div>
    ))}
  </div>
);
// --- Care Plan List Page ---
export default function CarePlanList() {
  document.title = "Care Plans | Care Management System";
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const { userQuery } = useUser();
  const { data: user } = userQuery;
  const [planToDelete, setPlanToDelete] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // New state for tabs and pagination
  const [activeTab, setActiveTab] = useState("ongoing");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchPlans = () => {
      setLoading(true);
      getCarePlans(token)
        .then((res) => setPlans(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    };
    fetchPlans();
  }, [token, navigate]);

  const handleGoBack = () => {
    if (window.history.state && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleStatusChange = async (planId, goalIndex, status) => {
    setUpdatingId(`${planId}-${goalIndex}`);
    await updateGoalStatus({ planId, goalIndex, status }, token);
    const refreshedPlans = await getCarePlans(token);
    setPlans(refreshedPlans.data);
    setUpdatingId(null);
  };

  const handleDelete = async () => {
    if (!planToDelete) return;
    try {
      // Use careID for the API call and _id for the local state update
      await deleteCarePlan(planToDelete.careID, token);
      setPlans(plans.filter((p) => p._id !== planToDelete._id));
      setShowConfirm(false);
      setPlanToDelete(null);
    } catch (error) {
      console.error("Failed to delete care plan", error);
      // Optionally, show an error message to the user
    }
  };

  const confirmDeletion = (plan) => {
    // Store the entire plan object
    setPlanToDelete(plan);
    setShowConfirm(true);
  };

  const GoalStatusBadge = ({ status }) => {
    const statusStyles = {
      pending:
        "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
      "in progress":
        "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
      achieved:
        "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    };
    return (
      <span
        className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${statusStyles[status]}`}
      >
        {status}
      </span>
    );
  };

  // Filter plans based on their goals' statuses
  const ongoingPlans = plans.filter((plan) =>
    plan.goals.some((goal) => goal.status !== "achieved")
  );
  const completedPlans = plans.filter((plan) =>
    plan.goals.every((goal) => goal.status === "achieved")
  );

  // Pagination logic
  const plansToDisplay =
    activeTab === "ongoing" ? ongoingPlans : completedPlans;
  const totalPages = Math.ceil(plansToDisplay.length / itemsPerPage);
  const paginatedPlans = plansToDisplay.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page on tab change
  };
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {/* --- RESPONSIVE Header --- */}
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
                Service User Care Plans
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Track and manage the progress of all wellness goals.
              </p>
            </div>
          </div>
          <Link
            to="/wellness/plans/create"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FE4982] text-white font-bold py-2.5 px-4 rounded-lg hover:bg-[#E03A6D] transition-all flex-shrink-0"
          >
            <PlusIcon /> Create New Plan
          </Link>
        </div>

        {/* Tabs for Ongoing and Completed */}
        <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
          <nav className="flex space-x-4">
            <button
              onClick={() => handleTabClick("ongoing")}
              className={`py-2 px-3 font-semibold flex items-center space-x-2 ${
                activeTab === "ongoing"
                  ? "text-[#FE4982] border-b-2 border-[#FE4982]"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <span>On Going</span>
              {!loading && (
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    activeTab === "ongoing"
                      ? "bg-[#FE4982] text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {ongoingPlans.length}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabClick("completed")}
              className={`py-2 px-3 font-semibold flex items-center space-x-2 ${
                activeTab === "completed"
                  ? "text-green-500 border-b-2 border-green-500"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <span>Completed</span>
              {!loading && (
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    activeTab === "completed"
                      ? "bg-green-500 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {completedPlans.length}
                </span>
              )}
            </button>
          </nav>
        </div>
        <div className="space-y-6">
          {loading ? (
            <CardSkeleton />
          ) : paginatedPlans.length > 0 ? (
            paginatedPlans.map((plan) => (
              <div
                key={plan._id}
                className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="border-b border-slate-100 dark:border-slate-700 pb-4 mb-4 flex-grow">
                    <h2 className="text-xl font-bold text-[#1D2056] dark:text-slate-100">
                      {plan.title}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
                      Service User: {plan.patient?.name}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm">
                      {plan.description}
                    </p>
                  </div>
                  <div className="flex items-center ml-4">
                    <Link
                      to={`/wellness/plans/${plan.careID}`}
                      className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-2"
                    >
                      <EditIcon size={20} />
                    </Link>
                    {user && user.role === "admin" && (
                      <button
                        onClick={() => confirmDeletion(plan)} // Pass the entire plan object
                        className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-2"
                        title="Delete Care Plan"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                </div>
                <ul className="space-y-3">
                  {plan.goals.map((g, i) => (
                    <li
                      key={i}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 dark:text-slate-500 flex-shrink-0">
                          <TargetIcon size={16} />
                        </span>
                        <span className="text-slate-700 dark:text-slate-200">
                          {g.goal}
                        </span>
                      </div>
                      <div className="relative flex items-center gap-3 self-end sm:self-center">
                        <GoalStatusBadge status={g.status} />
                        {g.status !== "achieved" && (
                          <select
                            value={g.status}
                            onChange={(e) =>
                              handleStatusChange(plan._id, i, e.target.value)
                            }
                            disabled={updatingId === `${plan._id}-${i}`}
                            className="bg-white appearance-none pr-6 dark:bg-slate-700 border text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 rounded-md text-xs p-1.5 focus:ring-1 focus:ring-[#FE4982] focus:outline-none disabled:opacity-50"
                          >
                            <option value="pending">Pending</option>
                            <option value="in progress">In Progress</option>
                            <option value="achieved">Achieved</option>
                          </select>
                        )}
                        {g.status !== "achieved" && (
                          <div className="pointer-events-none absolute inset-y-0 right-[6px] flex items-center text-slate-400">
                            <svg
                              className="w-3 h-3"
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
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="text-center flex flex-col py-16 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
              <span className="mx-auto text-slate-400 dark:text-slate-500">
                <ClipboardListIcon />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-200">
                No {activeTab === "ongoing" ? "On Going" : "Completed"} Care
                Plans Found
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {activeTab === "ongoing"
                  ? "All care plans are completed or none have been created."
                  : "Get started by creating a new care plan for a service user."}
              </p>
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 mx-1 rounded-md bg-slate-200 dark:bg-slate-700 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-4 py-2 mx-1 text-slate-700 dark:text-slate-200">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 mx-1 rounded-md bg-slate-200 dark:bg-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Confirm Deletion
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Are you sure you want to delete this care plan? This action cannot
              be undone.
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg text-white bg-red-500 hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
