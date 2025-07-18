import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCaregiverById } from "../services/caregiver";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Spinner from "../components/Spinner"; // Assuming you have a Spinner component
import {
  BackIcon,
  UserIcon,
  MailIcon,
  CalendarIcon,
  IdIcon,
  CheckCircleIcon, // Icon for 'Available'
  XCircleIcon, // Icon for 'Not Available'
  NoteIcon, // Added for absences
  TrashIcon,
} from "../Icons"; // Make sure to add CheckCircleIcon and XCircleIcon to your icons file
import axios from "axios";

export default function ViewCaregiver() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [caregiver, setCaregiver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCaregiver = async () => {
      setLoading(true);
      try {
        const response = await getCaregiverById(id, token);
        setCaregiver(response.data);
        document.title = `${response.data.name} | Caregiver Details`;
      } catch (err) {
        setError("Failed to fetch caregiver details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCaregiver();
  }, [id, token]);

  const handleClearAbsences = async () => {
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/carer/${id}/absences`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setCaregiver((prev) => ({
      ...prev,
      absences: [], // Clear absences in the state
    }));
    setTimeout(() => {
      navigate(`/caregivers/view/${id}`); // Redirect after clearing
    }, 1000);
  };

  // Helper to format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = date.toLocaleDateString("en-US", { weekday: "long" });
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return { day, formattedDate };
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <div className="h-screen flex items-center justify-center">
          <Spinner />
        </div>
        <Footer />
      </div>
    );

  if (error) return <p>{error}</p>;
  if (!caregiver) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate("/caregivers")}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors duration-200"
            >
              <BackIcon />
            </button>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Caregiver Details
            </h1>
          </div>

          {/* Caregiver Profile Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 md:p-8">
            <div className="md:flex md:items-start md:gap-8">
              <div className="flex-shrink-0 w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto md:mx-0">
                {caregiver.avatar ? (
                  <img
                    src={caregiver.avatar}
                    alt={caregiver.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-slate-500">
                    <UserIcon size={30} className="w-12 h-12 text-slate-500" />
                  </span>
                )}
              </div>
              <div className="mt-6 md:mt-0 flex-grow text-center md:text-left">
                <h2 className="text-3xl font-bold text-[#FE4982]">
                  {caregiver.name}
                </h2>
                <p className="text-md text-slate-500 dark:text-slate-400 capitalize">
                  {caregiver.role}
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                  <div className="flex items-center gap-3">
                    <span className="dark:text-slate-400 text-slate-700">
                      <MailIcon />
                    </span>
                    <a
                      href={`mailto:${caregiver.email}`}
                      className="text-slate-700 dark:text-slate-200 hover:underline"
                    >
                      {caregiver.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="dark:text-slate-400 text-slate-700">
                      <CalendarIcon />
                    </span>
                    <span className="text-slate-700 dark:text-slate-200">
                      Joined: {formatDate(caregiver.createdAt).formattedDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 col-span-full">
                    <span className="dark:text-slate-400 text-slate-700">
                      <IdIcon />
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-sm font-mono">
                      {caregiver._id}
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex justify-center md:justify-end gap-3 dark:text-slate-100 text-slate-900">
                  <Link
                    to={`/caregivers/edit/${caregiver._id}`}
                    className="py-2 px-4 bg-slate-200 dark:bg-slate-700 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* --- MODIFIED SECTION: Availability --- */}
          <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 md:p-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-3">
              <CalendarIcon /> Availability
            </h3>
            {caregiver.availability && caregiver.availability.length > 0 ? (
              <ul className="space-y-4">
                {caregiver.availability.map((slot, index) => {
                  const { day, formattedDate } = formatDate(slot.date);
                  return (
                    <li
                      key={index}
                      className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {day}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {formattedDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {slot.isAvailable ? (
                          <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircleIcon className="w-5 h-5" />
                            <span className="font-semibold text-sm">
                              Available
                            </span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <XCircleIcon className="w-5 h-5" />
                            <span className="font-semibold text-sm">
                              Not Available
                            </span>
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                No availability information provided.
              </p>
            )}
          </div>

          {/* --- UNCHANGED SECTION: Absences --- */}
          <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-3">
                <NoteIcon /> Absence Notes
              </h3>
              {caregiver.absences && caregiver.absences.length > 0 && (
                <button
                  onClick={handleClearAbsences} // Open modal on click
                  className="bg-red-500 hover:bg-red-600 text-white font-bold -mt-5 py-2 px-4 rounded-lg flex items-center justify-center sm:justify-start gap-2 disabled:bg-opacity-60"
                >
                  <TrashIcon />
                  Clear
                </button>
              )}
            </div>
            {caregiver.absences && caregiver.absences.length > 0 ? (
              <ul className="space-y-4">
                {caregiver.absences.map((absence, index) => (
                  <li
                    key={index}
                    className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                  >
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      <span className="font-bold">Date:</span>{" "}
                      {formatDate(absence.date).formattedDate}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                      <span className="font-bold">Reason:</span>{" "}
                      {absence.reason}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                No absences recorded.
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
