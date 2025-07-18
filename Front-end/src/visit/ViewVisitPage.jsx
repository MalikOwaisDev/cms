import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getVisitById } from "../services/visit";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  BackIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  PatientIcon,
  CheckCircleIcon,
  PillIcon,
  XCircleIcon, // For incomplete tasks
} from "../Icons"; // Assuming Icons.js is in the right place

// A simple loading spinner component
const Spinner = () => (
  <div className="flex justify-center items-center p-16">
    <div className="w-12 h-12 border-4 border-slate-200 border-t-[#FE4982] rounded-full animate-spin"></div>
  </div>
);

// Component for the main status badge
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

export default function ViewVisitPage() {
  document.title = "Visit Details | Care Management System";
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchVisitDetails = async () => {
      setLoading(true);
      try {
        const response = await getVisitById(id, token);
        setVisit(response.data.visit);
      } catch (err) {
        console.error("Failed to fetch visit details:", err);
        setError(
          "Could not load visit details. It may have been deleted or an error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVisitDetails();
  }, [id, token, navigate]);

  // --- Helper Functions ---
  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return new Date(`1970-01-01T${timeString}Z`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const createMapLink = (coords) => {
    if (!coords) return null;
    return `https://www.google.com/maps/search/?api=1&query=${coords}`;
  };

  // --- Main Render Logic ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Spinner />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="flex-grow container mx-auto p-8 text-center">
          <p className="text-red-500 bg-red-50 dark:bg-red-900/20 p-8 rounded-xl">
            {error}
          </p>
          <button
            onClick={() => navigate("/visits")}
            className="mt-6 inline-flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            <BackIcon />
            Back to All Visits
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex items-start gap-4 mb-8">
            <button
              onClick={() => navigate("/visits")}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 flex-shrink-0"
            >
              <span className="text-slate-600 dark:text-slate-300">
                <BackIcon />
              </span>
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
                Visit Details
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                A complete overview of the visit for{" "}
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {visit.patient?.name}
                </span>
                .
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Primary Visit Info */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    Visit Information
                  </h2>
                  <StatusBadge status={visit.status} />
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3 text-slate-600 dark:text-slate-200">
                    <PatientIcon />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Service User
                      </p>
                      <p className="font-semibold text-slate-700 dark:text-slate-200">
                        {visit.patient?.name || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-slate-600 dark:text-slate-200">
                    <UserIcon />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Caregiver
                      </p>
                      <p className="font-semibold text-slate-700 dark:text-slate-200">
                        {visit.caregiver?.name || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-slate-600 dark:text-slate-200">
                    <CalendarIcon />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Date
                      </p>
                      <p className="font-semibold text-slate-700 dark:text-slate-200">
                        {new Date(visit.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-slate-600 dark:text-slate-200">
                    <ClockIcon />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Time
                      </p>
                      <p className="font-semibold text-slate-700 dark:text-slate-200">{`${formatTime(
                        visit.startTime
                      )} - ${formatTime(visit.endTime)}`}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamps & Location */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Timestamps & Location
                </h2>
                <div className="mt-6 space-y-5">
                  <div className="flex items-start gap-3">
                    <span className="text-green-500">
                      <MapPinIcon />
                    </span>

                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Check-in
                      </p>
                      <p className="font-semibold text-slate-700 dark:text-slate-200">
                        {formatDateTime(visit.checkInTime)}
                      </p>
                      {visit.checkInLocation && (
                        <a
                          href={createMapLink(visit.checkInLocation)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#FE4982] hover:underline"
                        >
                          View on Map
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-500">
                      <MapPinIcon />
                    </span>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Check-out
                      </p>
                      <p className="font-semibold text-slate-700 dark:text-slate-200">
                        {formatDateTime(visit.checkOutTime)}
                      </p>
                      {visit.checkOutLocation && (
                        <a
                          href={createMapLink(visit.checkOutLocation)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#FE4982] hover:underline"
                        >
                          View on Map
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Tasks */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
                  Tasks
                </h2>
                <div className="space-y-4">
                  {visit.taskList?.length > 0 ? (
                    visit.taskList.map((task) => (
                      <div
                        key={task._id}
                        className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {task.completed ? (
                            <span className="text-green-500">
                              <CheckCircleIcon />
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              <XCircleIcon />
                            </span>
                          )}
                          <p
                            className={`flex-grow font-medium ${
                              task.completed
                                ? "line-through text-slate-500"
                                : "text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            {task.taskName}
                          </p>
                        </div>
                        {task.notes && (
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 pl-8 border-l-2 border-slate-200 dark:border-slate-600 ml-2.5 py-1">
                            Note: {task.notes}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No tasks were assigned for this visit.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-8">
              {/* Medications */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
                  Medications
                </h2>
                <div className="space-y-4">
                  {visit.medicationList?.length > 0 ? (
                    visit.medicationList.map((med) => (
                      <div
                        key={med._id}
                        className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <PillIcon /> {med.medicationName}
                          </p>
                          <StatusBadge status={med.status} />
                        </div>
                        {med.notes && (
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 pl-8 border-l-2 border-slate-200 dark:border-slate-600 ml-2.5 py-1">
                            Note: {med.notes}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No medications were scheduled for this visit.
                    </p>
                  )}
                </div>
              </div>

              {/* General Notes */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
                  General Visit Notes
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                  {visit.notes || "No general notes were added for this visit."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
