import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getCarePlan, updateCarePlan } from "../services/wellness";
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

// --- RESPONSIVE Skeleton Loader ---
const FormSkeleton = () => (
  <div className="animate-pulse space-y-8">
    <div className="space-y-6">
      <div className="h-5 w-1/4 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      </div>
      <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
    </div>
    <div className="space-y-6">
      <div className="h-5 w-1/4 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
      <div className="space-y-4">
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      </div>
    </div>
  </div>
);

export default function EditCarePlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (form?.title) {
      document.title = `Edit: ${form.title} | CMS`;
    } else {
      document.title = "Edit Care Plan | CMS";
    }
  }, [form?.title]);

  useEffect(() => {
    if (!token) navigate("/login");

    const fetchData = async () => {
      try {
        const planRes = await getCarePlan(id, token);
        setForm(planRes.data);
      } catch (err) {
        setError(
          "Failed to load care plan data. Please go back and try again."
        );
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, [id, token, navigate]);

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
    setError("");
    setSuccess("");
    if (!form.patient || !form.title || form.goals.some((g) => !g.goal)) {
      setError("Service User, Title, and all Goal fields are required.");
      return;
    }
    setSubmitting(true);
    try {
      await updateCarePlan(id, form, token);
      setSuccess("Care plan updated successfully!");
      setTimeout(() => {
        setSuccess("");
        navigate(`/patients/${form.patient._id}/wellness`);
      }, 1500);
    } catch (err) {
      setError("Failed to update care plan. Please try again.");
      console.error("Error updating care plan:", err);
    } finally {
      setSubmitting(false);
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
          {pageLoading ? (
            <FormSkeleton />
          ) : !form ? (
            <div className="text-center py-10">
              <p className="text-red-500">
                {error || "Could not find the requested care plan."}
              </p>
              <button
                onClick={handleGoBack}
                className="mt-4 bg-[#FE4982] text-white font-bold py-2 px-5 rounded-lg"
              >
                Go Back
              </button>
            </div>
          ) : (
            <>
              {/* --- RESPONSIVE Header --- */}
              <div className="flex items-start gap-4 mb-8">
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
                    Edit Care Plan
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Update the details for{" "}
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {form.patient?.name}'s
                    </span>{" "}
                    wellness plan.
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
                        <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                          <UserIcon />
                        </span>
                        <input
                          id="patient"
                          value={form.patient?.name || "N/A"}
                          readOnly
                          disabled
                          className="w-full pl-10 pr-4 py-3 appearance-none bg-slate-200/50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none disabled:cursor-not-allowed"
                        />
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
                      Description
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
                            onChange={(e) =>
                              handleGoalChange(idx, e.target.value)
                            }
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
                      disabled={submitting}
                      className="w-full sm:w-auto bg-[#FE4982] text-white font-bold py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-[#E03A6D] disabled:bg-opacity-60"
                    >
                      {submitting ? (
                        "Saving..."
                      ) : (
                        <>
                          <SaveIcon /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
