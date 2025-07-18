import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getPatients } from "../services/patient";
import { createCarePlan } from "../services/wellness";
import {
  UserIcon,
  ClipboardIcon,
  AlignLeftIcon,
  TargetIcon,
  PlusIcon,
  TrashIcon,
  SaveIcon,
  BackIcon,
} from "../Icons";

export default function CarePlanForm() {
  document.title = "New Care Plan | Care Management System";
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId");
  const [form, setForm] = useState({
    patient: patientId || "",
    title: "",
    description: "",
    goals: [{ goal: "", status: "pending" }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) navigate("/login");
    getPatients(token)
      .then((res) => setPatients(res.data))
      .catch(() => setError("Could not load service users."));
  }, [token, navigate]);

  const handleFormChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleGoalChange = (index, value) => {
    const newGoals = [...form.goals];
    newGoals[index].goal = value;
    setForm({ ...form, goals: newGoals });
  };

  const addGoal = () =>
    setForm({
      ...form,
      goals: [...form.goals, { goal: "", status: "pending" }],
    });
  const removeGoal = (index) =>
    setForm({ ...form, goals: form.goals.filter((_, i) => i !== index) });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setError("");
    setSuccess("");

    // Validation: Check if all required fields are filled
    if (!form.patient || !form.title || form.goals.some((g) => !g.goal)) {
      setError("Service User, Title, and all Goal fields are required.");
      return;
    }

    setLoading(true); // Set loading state

    try {
      // Attempt to create the care plan via API
      await createCarePlan(form, token);
      setSuccess("Care plan created successfully!");

      // Delay navigation for the user to read success message
      setTimeout(() => {
        navigate(`/wellness/plans`);
      }, 1500); // 1.5 seconds delay before navigating
    } catch (err) {
      // Log error details for debugging
      console.error("Error creating care plan:", err);

      // Handle error and show specific message
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create care plan. Please try again.";

      setError(errorMessage); // Show the error message to the user
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleGoBack = () => {
    if (window.history.state && window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/wellness/plans");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-sans">
      <Header />

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          {/* --- RESPONSIVE Header --- */}
          <div className="flex items-center gap-4 mb-8">
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
                Create New Care Plan
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Develop a personalized health and wellness plan for a service
                user.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-sm space-y-8"
          >
            <fieldset className="space-y-6">
              <legend className="text-lg font-semibold text-[#1D2056] dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                Plan Details
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="patient"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Service User
                  </label>
                  <div className="relative">
                    {/* RESPONSIVE: Centered Icon */}
                    <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                      <UserIcon />
                    </span>
                    <select
                      id="patient"
                      name="patient"
                      value={form.patient}
                      onChange={handleFormChange}
                      className="w-full pl-10 pr-10 py-3 appearance-none bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
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
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                      <svg
                        className="w-5 h-5"
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
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Plan Title
                  </label>
                  <div className="relative">
                    <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                      <ClipboardIcon />
                    </span>
                    <input
                      id="title"
                      name="title"
                      value={form.title}
                      onChange={handleFormChange}
                      placeholder="e.g., Post-Surgery Recovery"
                      className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Description (Optional)
                </label>
                <div className="relative">
                  <span className="absolute top-4 left-3 text-slate-400">
                    <AlignLeftIcon />
                  </span>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    rows="4"
                    placeholder="Briefly describe the purpose and scope of this care plan."
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                  ></textarea>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-lg font-semibold text-[#1D2056] dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                Service User Goals
              </legend>
              <div className="space-y-4">
                {form.goals.map((g, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="relative flex-grow">
                      <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                        <TargetIcon />
                      </span>
                      <input
                        value={g.goal}
                        onChange={(e) => handleGoalChange(idx, e.target.value)}
                        placeholder={`Goal #${idx + 1}`}
                        className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                      />
                    </div>
                    {form.goals.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGoal(idx)}
                        className="text-red-500 hover:text-red-700 p-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex-shrink-0"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addGoal}
                  className="flex items-center gap-2 text-[#1D2056] dark:text-slate-200 font-semibold py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <PlusIcon /> Add Another Goal
                </button>
              </div>
            </fieldset>

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

              {/* --- RESPONSIVE Action Buttons --- */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-4">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="w-full sm:w-auto flex justify-center items-center bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-[#FE4982] text-white font-bold py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-[#E03A6D] disabled:bg-opacity-60"
                >
                  {loading ? (
                    "Saving..."
                  ) : (
                    <>
                      <SaveIcon /> Create Plan
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
