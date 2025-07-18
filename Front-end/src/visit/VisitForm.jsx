import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  createVisit,
  getAvailableCaregivers,
  getCaregivers,
  getPatients,
} from "../services/visit";
import {
  UserIcon,
  PatientIcon, // Assuming you have a patient icon
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  PlusIcon,
  TrashIcon,
  SaveIcon,
  BackIcon,
  CheckCircleIcon, // For tasks
  PillIcon, // For medications
} from "../Icons"; // Make sure to create and export these icons

export default function VisitForm() {
  document.title = "New Visit | Care Management System";
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Initial state for the form, based on the visitSchema
  const initialFormState = {
    caregiver: "",
    patient: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    taskList: [],
    medicationList: [],
    status: "scheduled",
  };

  const [form, setForm] = useState(initialFormState);
  const [caregivers, setCaregivers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch caregivers and patients when the component mounts
  useEffect(() => {
    if (!token) {
      navigate("/login"); // Redirect to login if no token
      return;
    }

    const fetchData = async () => {
      setLoading(true); // Set loading state to true while fetching data
      try {
        // Use Promise.all to fetch both caregivers and patients concurrently
        const [caregiversRes, patientsRes] = await Promise.all([
          getCaregivers(token),
          getPatients(token),
        ]);

        // Set data once both requests succeed
        setCaregivers(caregiversRes.data);
        setPatients(patientsRes.data);
      } catch (err) {
        // Log the error for debugging purposes
        console.error("Error fetching caregivers or patients:", err);

        // Set error message with specific feedback
        if (err?.response?.data?.message) {
          setError(err.response.data.message); // Display backend error message if available
        } else {
          setError("Failed to load caregivers or service users.");
        }
      } finally {
        setLoading(false); // Set loading state to false once requests are done
      }
    };

    fetchData(); // Call the function to fetch data
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // --- Task Management ---
  const handleAddTask = () => {
    setForm({
      ...form,
      taskList: [...form.taskList, { taskName: "", completed: false }],
    });
  };

  const handleTaskChange = (index, value) => {
    const updatedTasks = form.taskList.map((task, i) =>
      i === index ? { ...task, taskName: value } : task
    );
    setForm({ ...form, taskList: updatedTasks });
  };

  const handleRemoveTask = (index) => {
    const updatedTasks = form.taskList.filter((_, i) => i !== index);
    setForm({ ...form, taskList: updatedTasks });
  };

  // --- Medication Management ---
  const handleAddMedication = () => {
    setForm({
      ...form,
      medicationList: [
        ...form.medicationList,
        { medicationName: "", status: "given" },
      ],
    });
  };

  const handleMedicationChange = (index, value) => {
    const updatedMedications = form.medicationList.map((med, i) =>
      i === index ? { ...med, medicationName: value } : med
    );
    setForm({ ...form, medicationList: updatedMedications });
  };

  const handleRemoveMedication = (index) => {
    const updatedMedications = form.medicationList.filter(
      (_, i) => i !== index
    );
    setForm({ ...form, medicationList: updatedMedications });
  };

  const handleDateChange = async (date) => {
    const res = await getAvailableCaregivers(token, date);
    setCaregivers(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.caregiver ||
      !form.patient ||
      !form.date ||
      !form.startTime ||
      !form.endTime
    ) {
      setError("Please fill out all required visit details.");
      return;
    }
    setLoading(true);

    try {
      await createVisit(form, token);
      setSuccess("Visit created successfully!");
      setTimeout(() => {
        setSuccess("");
        navigate("/"); // Or wherever you list visits
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to create visit.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => navigate(-1);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleGoBack}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <span className="text-slate-600 dark:text-slate-300">
                <BackIcon />
              </span>
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
                Schedule New Visit
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Fill in the details to schedule a new visit for a carer.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-sm space-y-8"
          >
            {/* --- Visit Details --- */}
            <fieldset className="space-y-6">
              <legend className="text-lg font-semibold text-[#1D2056] dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
                Visit Details
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="caregiver"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 after:content-['*'] after:text-red-500 after:ml-0.5"
                  >
                    Assign Caregiver
                  </label>
                  <div className="relative">
                    <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                      <UserIcon />
                    </span>
                    <select
                      id="caregiver"
                      name="caregiver"
                      value={form.caregiver}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-100 text-slate-800 dark:text-slate-200 dark:bg-slate-700 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
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
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="patient"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 after:content-['*'] after:text-red-500 after:ml-0.5"
                  >
                    Assign Service User
                  </label>
                  <div className="relative">
                    <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                      <PatientIcon />
                    </span>
                    <select
                      id="patient"
                      name="patient"
                      value={form.patient}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-100 text-slate-800 dark:text-slate-200 dark:bg-slate-700 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                    >
                      <option value="" disabled>
                        Select a service user
                      </option>
                      {patients.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 after:content-['*'] after:text-red-500 after:ml-0.5"
                  >
                    Date
                  </label>
                  <div className="relative">
                    <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                      <CalendarIcon />
                    </span>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={(e) => {
                        handleChange(e);
                        handleDateChange(e.target.value);
                      }}
                      required
                      className="w-full pl-10 pr-4 py-3 text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="startTime"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 after:content-['*'] after:text-red-500 after:ml-0.5"
                  >
                    Start Time
                  </label>
                  <div className="relative">
                    <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                      <ClockIcon />
                    </span>
                    <input
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={form.startTime}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="endTime"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 after:content-['*'] after:text-red-500 after:ml-0.5"
                  >
                    End Time
                  </label>
                  <div className="relative">
                    <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                      <ClockIcon />
                    </span>
                    <input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={form.endTime}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Location (optional)
                </label>
                <div className="relative">
                  <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                    <MapPinIcon />
                  </span>
                  <input
                    id="location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g., Service User's Home"
                    className="w-full pl-10 pr-4 py-3 text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                  />
                </div>
              </div>
            </fieldset>

            {/* --- Task List --- */}
            <fieldset>
              <legend className="text-lg font-semibold text-[#1D2056] dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
                Tasks
              </legend>
              <div className="space-y-4">
                {form.taskList.map((task, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-slate-400">
                      <CheckCircleIcon />
                    </span>
                    <input
                      type="text"
                      value={task.taskName}
                      onChange={(e) => handleTaskChange(index, e.target.value)}
                      placeholder={`Task ${index + 1}`}
                      className="flex-grow pl-4 pr-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(index)}
                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  <PlusIcon />
                  Add Task
                </button>
              </div>
            </fieldset>

            {/* --- Medication List --- */}
            <fieldset>
              <legend className="text-lg font-semibold text-[#1D2056] dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
                Medications
              </legend>
              <div className="space-y-4">
                {form.medicationList.map((med, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-slate-400">
                      <PillIcon />
                    </span>
                    <input
                      type="text"
                      value={med.medicationName}
                      onChange={(e) =>
                        handleMedicationChange(index, e.target.value)
                      }
                      placeholder={`Medication ${index + 1}`}
                      className="flex-grow pl-4 pr-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(index)}
                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  <PlusIcon />
                  Add Medication
                </button>
              </div>
            </fieldset>

            {/* --- Form Actions --- */}
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
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-4">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="w-full sm:w-auto flex justify-center items-center bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-[#FE4982] text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-[#E03A6D] disabled:bg-opacity-60"
                >
                  {loading ? (
                    "Saving..."
                  ) : (
                    <>
                      <SaveIcon />
                      Create Visit
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
