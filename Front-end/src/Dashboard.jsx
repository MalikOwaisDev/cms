import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios"; // Make sure axios is installed

// --- Original Imports (Assuming these are in your project) ---
import Header from "./components/Header"; // Assuming Header component exists
import Footer from "./components/Footer"; // Assuming Footer component exists
import { useUser } from "./hooks/useUser"; // Assuming useUser hook exists
import {
  PatientsIcon,
  TrainingIcon,
  InvoicesIcon,
  WellnessIcon,
  AlertCircleIcon,
  ViewIcon,
} from "./Icons"; // Assuming Icons are in a separate file

// --- Integrated Components ---

// Check/Cross Icons for Notifications
const CheckCircleIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const XCircleIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

/**
 * Notification Component
 */
const Notification = ({ message, type, onDismiss }) => {
  if (!message) return null;
  const isSuccess = type === "success";

  return (
    <div
      className={`fixed top-24 right-5 w-full max-w-sm p-4 rounded-xl shadow-lg flex items-center gap-4 z-50 transition-transform transform-gpu
        ${
          isSuccess
            ? "bg-green-50 dark:bg-green-900/50 border border-green-300 dark:border-green-500/30 text-green-800 dark:text-green-300"
            : "bg-red-50 dark:bg-red-900/50 border border-red-300 dark:border-red-500/30 text-red-800 dark:text-red-300"
        }`}
    >
      {isSuccess ? (
        <CheckCircleIcon className="w-6 h-6" />
      ) : (
        <XCircleIcon className="w-6 h-6" />
      )}
      <span className="flex-grow text-sm font-medium">{message}</span>
      <button
        onClick={onDismiss}
        className="text-xl font-light leading-none hover:opacity-75"
      >
        &times;
      </button>
    </div>
  );
};

/**
 * DebouncedTextarea: Saves notes after the user stops typing.
 */
const DebouncedTextarea = ({ initialValue, onSave, placeholder }) => {
  const [value, setValue] = useState(initialValue);
  const debounceTimeout = useRef(null);

  const handleChange = (e) => {
    const text = e.target.value;
    setValue(text);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      onSave(text);
    }, 1000); // 1-second delay
  };

  useEffect(() => {
    // Clean up timeout on unmount
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  return (
    <textarea
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full mt-2 p-2 text-sm bg-slate-100 dark:bg-slate-600 border border-transparent rounded-md focus:ring-2 focus:ring-[#FE4982] focus:border-[#FE4982] dark:text-slate-200"
      rows="2"
    />
  );
};

/**
 * TaskListItem Component: Includes a notes textarea.
 */
const TaskListItem = ({ task, onToggle, onUpdateNotes }) => (
  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        id={`task-${task._id}`}
        checked={task.completed}
        onChange={(e) => onToggle(e.target.checked)}
        className="h-5 w-5 rounded border-gray-300 text-[#FE4982] focus:ring-[#FE4982] dark:bg-slate-600 dark:border-slate-500"
      />
      <label
        htmlFor={`task-${task._id}`}
        className={`flex-grow text-sm font-medium ${
          task.completed
            ? "text-slate-400 dark:text-slate-500 line-through"
            : "text-slate-700 dark:text-slate-300"
        }`}
      >
        {task.taskName}
      </label>
    </div>
    <DebouncedTextarea
      initialValue={task.notes || ""}
      onSave={onUpdateNotes}
      placeholder="Add task notes..."
    />
  </div>
);

/**
 * MedicationListItem Component
 */
// CHANGED: Added `onUpdateNotes` prop and DebouncedTextarea
const MedicationListItem = ({ medication, onUpdateStatus, onUpdateNotes }) => (
  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
    <p className="font-medium text-slate-700 dark:text-slate-300">
      {medication.medicationName}
    </p>
    <div className="flex items-center gap-2 mt-2">
      {["given", "refused", "missed"].map((status) => (
        <button
          key={status}
          onClick={() => onUpdateStatus(status)}
          className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-colors
            ${
              medication.status === status
                ? "bg-[#FE4982] text-white"
                : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500"
            }`}
        >
          {status}
        </button>
      ))}
    </div>
    {/* NEW: Notes box for medications */}
    <DebouncedTextarea
      initialValue={medication.notes || ""}
      onSave={onUpdateNotes}
      placeholder="Add medication notes..."
    />
  </div>
);

/**
 * TaskList Component
 */
const TaskList = ({ visitId, tasks, onUpdateTask, onUpdateTaskNotes }) => (
  <div className="mt-4">
    <h4 className="text-md font-bold text-slate-700 dark:text-slate-200 mb-2">
      Tasks
    </h4>
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskListItem
          key={task._id}
          task={task}
          onToggle={(completed) => onUpdateTask(visitId, task._id, completed)}
          onUpdateNotes={(notes) => onUpdateTaskNotes(visitId, task._id, notes)}
        />
      ))}
    </div>
  </div>
);

/**
 * MedicationList Component
 */
// CHANGED: Added `onUpdateMedicationNotes` to pass down
const MedicationList = ({
  visitId,
  medications,
  onUpdateMedication,
  onUpdateMedicationNotes,
}) => (
  <div className="mt-4">
    <h4 className="text-md font-bold text-slate-700 dark:text-slate-200 mb-2">
      Medications
    </h4>
    <div className="space-y-2">
      {medications.map((med) => (
        <MedicationListItem
          key={med._id}
          medication={med}
          onUpdateStatus={(status) =>
            onUpdateMedication(visitId, med._id, status)
          }
          // NEW: Pass the notes handler to the list item
          onUpdateNotes={(notes) =>
            onUpdateMedicationNotes(visitId, med._id, notes)
          }
        />
      ))}
    </div>
  </div>
);

/**
 * VisitCard Component
 */
// CHANGED: Added `onUpdateMedicationNotes` prop
const VisitCard = ({
  visit,
  onCheckIn,
  onCheckOut,
  onUpdateTask,
  onUpdateMedication,
  onUpdateTaskNotes,
  onUpdateVisitNotes,
  onUpdateMedicationNotes,
}) => {
  const {
    patient,
    startTime,
    endTime,
    status,
    taskList,
    medicationList,
    notes,
  } = visit;
  const isInProgress = status === "in_progress";
  const isPending = status === "scheduled";

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
      <div className="p-6">
        {/* Patient and Visit Info */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="text-sm font-semibold text-[#FE4982] uppercase tracking-wide">
              {patient.name}
            </p>
            <h3 className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-100">
              {patient.diagnosis || "General Visit"}
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {patient.address.street}, {patient.address.city}
            </p>
          </div>
          <div
            className={`px-3 py-1 text-xs font-semibold rounded-full capitalize whitespace-nowrap
              ${
                status === "scheduled" &&
                "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300"
              }
              ${
                status === "in_progress" &&
                "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
              }
              ${
                status === "completed" &&
                "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
              }
            `}
          >
            {status.replace("_", " ")}
          </div>
        </div>

        {/* Check-in/Out Controls */}
        <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            {formatTime(startTime)} - {formatTime(endTime)}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => onCheckIn(visit._id)}
              disabled={!isPending}
              className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all"
            >
              Check In
            </button>
            <button
              onClick={() => onCheckOut(visit._id)}
              disabled={!isInProgress}
              className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg shadow-md hover:bg-red-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all"
            >
              Check Out
            </button>
          </div>
        </div>

        {/* Conditionally render tasks, meds, and notes */}
        {isInProgress && (
          <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
            {taskList && taskList.length > 0 && (
              <TaskList
                visitId={visit._id}
                tasks={taskList}
                onUpdateTask={onUpdateTask}
                onUpdateTaskNotes={onUpdateTaskNotes}
              />
            )}
            {medicationList && medicationList.length > 0 && (
              <MedicationList
                visitId={visit._id}
                medications={medicationList}
                onUpdateMedication={onUpdateMedication}
                // NEW: Pass the medication notes handler
                onUpdateMedicationNotes={onUpdateMedicationNotes}
              />
            )}

            {/* General Visit Notes Section */}
            <div className="mt-4">
              <h4 className="text-md font-bold text-slate-700 dark:text-slate-200 mb-2">
                Visit Notes
              </h4>
              <DebouncedTextarea
                initialValue={notes || ""}
                onSave={(text) => onUpdateVisitNotes(visit._id, text)}
                placeholder="Add general notes for the visit..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * DashboardCard Component
 */
const DashboardCard = ({ title, to, icon, description, colorClass }) => (
  <Link
    to={to}
    className="group block p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-zinc-300 dark:hover:shadow-zinc-700 hover:shadow-lg hover:border-[#FE4982]/50 dark:hover:border-[#FE4982] border border-transparent dark:border-slate-700 hover:-translate-y-1 transition-all duration-300"
  >
    <div className="flex items-start gap-4">
      <div className={`flex-shrink-0 p-3 rounded-lg ${colorClass.bg}`}>
        <div className={colorClass.text}>{icon}</div>
      </div>
      <div className="flex-grow">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          {title}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {description}
        </p>
      </div>
    </div>
  </Link>
);

// --- Main Integrated Dashboard Page ---
export default function Dashboard() {
  document.title = "Dashboard | Care Management System";
  const { userQuery } = useUser();
  const { data: user, isLoading: isUserLoading } = userQuery;
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = useState("");
  const [visits, setVisits] = useState([]);
  const [isVisitsLoading, setIsVisitsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });

  const token = localStorage.getItem("token");
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [navigate, token]);

  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
      const timer = setTimeout(() => {
        setError("");
        window.history.replaceState({}, document.title);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchVisits = async () => {
      if (user && user.role !== "admin") {
        setIsVisitsLoading(true);
        try {
          const res = await axios.get(
            "http://localhost:4000/api/visits/today",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setVisits(res.data.visits || []);
        } catch (err) {
          console.error("Failed to fetch visits", err);
          setError("Could not load today's visits. Please try again later.");
        } finally {
          setIsVisitsLoading(false);
        }
      }
    };
    fetchVisits();
  }, [user]);

  // --- Helper Functions for Visits ---
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 4000);
  };

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation is not supported by your browser.");
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) =>
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }),
          (err) => reject(`Geolocation error: ${err.message}`)
        );
      }
    });
  };

  const getAddressFromCoords = async (lat, lng) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;

    const response = await fetch(url); // no custom headers
    const data = await response.json();
    return data.display_name;
  };

  const handleCheckIn = async (visitId) => {
    try {
      const location = await getLocation(); // should return { lat, lng }

      const address = await getAddressFromCoords(location.lat, location.lng);
      await axios.patch(
        `http://localhost:4000/api/visits/${visitId}`,
        {
          checkInTime: new Date(),
          checkInLocation: `${location.lat},${location.lng}`,
          status: "in_progress",
          location: address, // Save address
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setVisits(
        visits.map((v) =>
          v._id === visitId ? { ...v, status: "in_progress" } : v
        )
      );
      showNotification("Checked in successfully!", "success");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Check-in failed";
      showNotification(errorMessage, "error");
    }
  };

  const handleCheckOut = async (visitId) => {
    try {
      const location = await getLocation();
      await axios.patch(
        `http://localhost:4000/api/visits/${visitId}`,
        {
          checkOutTime: new Date(),
          checkOutLocation: `${location.lat},${location.lng}`,
          status: "completed",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setVisits(
        visits.map((v) =>
          v._id === visitId ? { ...v, status: "completed" } : v
        )
      );
      showNotification("Checked out successfully!", "success");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Check-out failed";
      showNotification(errorMessage, "error");
    }
  };

  // --- Handlers for Task and Medication Updates ---
  const handleUpdateTask = async (visitId, taskId, completed) => {
    // Optimistically update the UI
    setVisits((currentVisits) =>
      currentVisits.map((visit) => {
        if (visit._id === visitId) {
          return {
            ...visit,
            taskList: visit.taskList.map((task) =>
              task._id === taskId ? { ...task, completed } : task
            ),
          };
        }
        return visit;
      })
    );

    try {
      // Send the request to the server
      await axios.patch(
        `http://localhost:4000/api/visits/${visitId}/tasks/${taskId}`,
        { completed },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Notify user of success
      showNotification("Task updated.", "success");
    } catch (err) {
      // Log error to the console for debugging
      console.error("Error updating task:", err);

      // Show failure notification
      showNotification("Failed to update task.", "error");

      // Revert the optimistic update in case of failure
      setVisits((currentVisits) =>
        currentVisits.map((visit) => {
          if (visit._id === visitId) {
            return {
              ...visit,
              taskList: visit.taskList.map((task) =>
                task._id === taskId ? { ...task, completed: !completed } : task
              ),
            };
          }
          return visit;
        })
      );
    }
  };

  const handleUpdateMedication = async (visitId, medicationId, status) => {
    // Optimistically update the UI
    setVisits((prevVisits) =>
      prevVisits.map((visit) => {
        if (visit._id === visitId) {
          return {
            ...visit,
            medicationList: visit.medicationList.map((med) =>
              med._id === medicationId ? { ...med, status } : med
            ),
          };
        }
        return visit;
      })
    );

    try {
      // Make the API call to update medication status
      await axios.patch(
        `http://localhost:4000/api/visits/${visitId}/medications/${medicationId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Notify the user of success
      showNotification("Medication status updated.", "success");
    } catch (err) {
      // Log the error for debugging
      console.error("Error updating medication:", err);

      // Handle error message from response or fallback to a default message
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update medication status.";

      // Show error notification
      showNotification(errorMessage, "error");

      // Revert the optimistic UI update in case of failure
      setVisits((prevVisits) =>
        prevVisits.map((visit) => {
          if (visit._id === visitId) {
            return {
              ...visit,
              medicationList: visit.medicationList.map((med) =>
                med._id === medicationId ? { ...med, status: !status } : med
              ),
            };
          }
          return visit;
        })
      );
    }
  };

  // --- Handlers for Notes Updates ---
  const handleUpdateTaskNotes = async (visitId, taskId, notes) => {
    // Optimistically update the UI
    setVisits((prevVisits) =>
      prevVisits.map((visit) =>
        visit._id === visitId
          ? {
              ...visit,
              taskList: visit.taskList.map((task) =>
                task._id === taskId ? { ...task, notes } : task
              ),
            }
          : visit
      )
    );

    try {
      // Make the API call to update task notes
      await axios.patch(
        `http://localhost:4000/api/visits/${visitId}/tasks/${taskId}`,
        { notes },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Show success notification
      showNotification("Task note saved.", "success");
    } catch (err) {
      // Log error for debugging
      console.error("Error saving task note:", err);

      // Show error notification
      showNotification("Failed to save task note.", "error");

      // Revert optimistic UI update on failure
      setVisits((prevVisits) =>
        prevVisits.map((visit) =>
          visit._id === visitId
            ? {
                ...visit,
                taskList: visit.taskList.map(
                  (task) =>
                    task._id === taskId ? { ...task, notes: "" } : task // Revert to original notes or empty
                ),
              }
            : visit
        )
      );
    }
  };

  const handleUpdateVisitNotes = async (visitId, notes) => {
    // Optimistically update the UI
    setVisits((prevVisits) =>
      prevVisits.map((visit) =>
        visit._id === visitId ? { ...visit, notes } : visit
      )
    );

    try {
      // Make the API call to update visit notes
      await axios.patch(
        `http://localhost:4000/api/visits/${visitId}`,
        { notes },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Show success notification
      showNotification("Visit note saved.", "success");
    } catch (err) {
      // Log the error for debugging
      console.error("Error updating visit note:", err);

      // Show error notification
      showNotification("Failed to save visit note.", "error");

      // Revert the optimistic UI update on failure
      setVisits((prevVisits) =>
        prevVisits.map(
          (visit) => (visit._id === visitId ? { ...visit, notes: "" } : visit) // Revert to original notes or empty
        )
      );
    }
  };

  // NEW: Handler for updating medication notes
  const handleUpdateMedicationNotes = async (visitId, medicationId, notes) => {
    // Optimistically update the UI
    setVisits((prevVisits) =>
      prevVisits.map((visit) =>
        visit._id === visitId
          ? {
              ...visit,
              medicationList: visit.medicationList.map((med) =>
                med._id === medicationId ? { ...med, notes } : med
              ),
            }
          : visit
      )
    );

    try {
      // Make the API call to update medication notes
      await axios.patch(
        `http://localhost:4000/api/visits/${visitId}/medications/${medicationId}`,
        { notes },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Show success notification
      showNotification("Medication note saved.", "success");
    } catch (err) {
      // Log the error for debugging
      console.error("Error updating medication note:", err);

      // Show error notification
      showNotification("Failed to save medication note.", "error");

      // Revert the optimistic UI update on failure
      setVisits((prevVisits) =>
        prevVisits.map((visit) =>
          visit._id === visitId
            ? {
                ...visit,
                medicationList: visit.medicationList.map(
                  (med) =>
                    med._id === medicationId ? { ...med, notes: "" } : med // Revert to original notes or empty
                ),
              }
            : visit
        )
      );
    }
  };

  // Loading state
  if (isUserLoading || (!user && !error)) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        <Header />
        <div className="w-full h-[85vh] flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Dashboard Items
  const dashboardItems = [
    {
      title: "Visits",
      to: "/visits",
      icon: <ViewIcon />,
      description: "Today's visits overview",
      colorClass: {
        bg: "bg-orange-100 dark:bg-orange-900/50",
        text: "text-orange-600 dark:text-orange-400",
      },
    },
    {
      title: "Service Users",
      to: "/patients",
      icon: <PatientsIcon />,
      description: "Manage service user records",
      colorClass: {
        bg: "bg-sky-100 dark:bg-sky-900/50",
        text: "text-sky-600 dark:text-sky-400",
      },
    },
    {
      title: "Caregivers",
      to: "/caregivers",
      icon: <AlertCircleIcon />,
      description: "Manage caregiver profiles",
      colorClass: {
        bg: "bg-pink-100 dark:bg-pink-900/50",
        text: "text-pink-600 dark:text-pink-400",
      },
    },
    {
      title: "Training",
      to: "/trainings",
      icon: <TrainingIcon />,
      description: "Assign & track modules",
      colorClass: {
        bg: "bg-purple-100 dark:bg-purple-900/50",
        text: "text-purple-600 dark:text-purple-400",
      },
    },
    {
      title: "Invoices",
      to: "/invoices",
      icon: <InvoicesIcon />,
      description: "Manage billing & payments",
      colorClass: {
        bg: "bg-yellow-100 dark:bg-yellow-900/50",
        text: "text-yellow-600 dark:text-yellow-400",
      },
    },
    {
      title: "Wellness Checks",
      to: "/wellness/plans",
      icon: <WellnessIcon />,
      description: "Monitor service user wellness",
      colorClass: {
        bg: "bg-teal-100 dark:bg-teal-900/50",
        text: "text-teal-600 dark:text-teal-400",
      },
    },
  ];

  const filteredDashboardItems =
    user?.role === "admin"
      ? dashboardItems
      : dashboardItems.filter(
          (item) => item.title !== "Invoices" && item.title !== "Visits"
        );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Header />
      <Notification
        message={notification.message}
        type={notification.type}
        onDismiss={() => setNotification({ message: "", type: "" })}
      />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-center p-8 rounded-xl">
            <h2 className="text-xl font-bold text-red-800 dark:text-red-300">
              An Error Occurred
            </h2>
            <p className="mt-1 text-red-700 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <>
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                Dashboard
              </h1>
              <p className="text-md text-slate-500 dark:text-slate-400 mt-1">
                Welcome back, {user?.name}!{" "}
                {user?.role === "admin"
                  ? "Here is your system overview."
                  : "Here are your visits for today."}
              </p>
            </div>

            {user?.role === "admin" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDashboardItems.map((item) => (
                  <DashboardCard key={item.title} {...item} />
                ))}
              </div>
            ) : (
              // Caregiver View
              <div>
                {isVisitsLoading ? (
                  <p className="text-center text-slate-500 dark:text-slate-400">
                    Loading today's visits...
                  </p>
                ) : visits.length === 0 ? (
                  <div className="text-center py-10 px-6 bg-white dark:bg-slate-800 rounded-xl">
                    <h3 className="text-lg text-slate-500 font-semibold">
                      No Visits Today
                    </h3>
                    <p className="text-slate-500 mt-1">Enjoy your day!</p>
                  </div>
                ) : (
                  visits.map((visit) => (
                    <VisitCard
                      key={visit._id}
                      visit={visit}
                      onCheckIn={handleCheckIn}
                      onCheckOut={handleCheckOut}
                      onUpdateTask={handleUpdateTask}
                      onUpdateMedication={handleUpdateMedication}
                      onUpdateTaskNotes={handleUpdateTaskNotes}
                      onUpdateVisitNotes={handleUpdateVisitNotes}
                      // NEW: Pass the new handler to the VisitCard
                      onUpdateMedicationNotes={handleUpdateMedicationNotes}
                    />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
