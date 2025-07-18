import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createResource } from "../services/wellness";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  TitleIcon,
  DescriptionIcon,
  LinkIcon,
  CategoryIcon,
  SaveIcon,
  BackIcon,
} from "../Icons";

// --- Main Form Component ---
export default function WellnessResourceForm() {
  document.title = "New Wellness Resource | Care Management System";
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    category: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem("token");

  const isFormValid =
    formData.title &&
    formData.title.length <= 100 &&
    formData.description &&
    formData.description.length <= 500 &&
    formData.category;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isFormValid) {
      setError("Please fill all required fields correctly before submitting.");
      return;
    }

    setLoading(true);
    try {
      await createResource(formData, token);
      setSuccess("Wellness resource created successfully!");
      setFormData({ title: "", description: "", link: "", category: "" });
      setTimeout(() => {
        setSuccess("");
        navigate("/wellness/resources");
      }, 1500);
    } catch (err) {
      setError("Failed to create the resource. Please try again.");
      console.error("Error submitting form:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (window.history.state && window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/wellness/resources");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-sans">
      <Header />

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          {/* --- RESPONSIVE Page Header --- */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleGoBack}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
            >
              <span className="text-slate-600 dark:text-slate-300">
                <BackIcon />
              </span>
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
                Create Wellness Resource
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Add a new diet, exercise, or mental health resource.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-sm space-y-8"
          >
            <fieldset className="space-y-6">
              <legend className="text-lg font-semibold text-[#1D2056] dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                Resource Details
              </legend>

              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Title
                </label>
                <div className="relative">
                  {/* RESPONSIVE: Centered Icon */}
                  <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                    <TitleIcon />
                  </span>
                  <input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="e.g., Guide to Mediterranean Diet"
                    maxLength="100"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                  />
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
                    <DescriptionIcon />
                  </span>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows="4"
                    maxLength="500"
                    required
                    placeholder="Briefly describe the resource and its benefits."
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                  ></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="link"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Resource Link (URL)
                  </label>
                  <div className="relative">
                    <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                      <LinkIcon />
                    </span>
                    <input
                      type="url"
                      id="link"
                      name="link"
                      value={formData.link}
                      onChange={handleFormChange}
                      placeholder="https://example.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Category
                  </label>
                  <div className="relative">
                    <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                      <CategoryIcon />
                    </span>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      required
                      className="w-full pl-10 pr-10 py-3 appearance-none bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      <option value="diet">Diet</option>
                      <option value="exercise">Exercise</option>
                      <option value="mental">Mental Health</option>
                      <option value="other">Other</option>
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
                  className="w-full sm:w-auto flex justify-center items-center bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="w-full sm:w-auto bg-[#FE4982] text-white font-bold py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-[#E03A6D] transition-all disabled:bg-opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    "Saving..."
                  ) : (
                    <>
                      <SaveIcon /> Create Resource
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
