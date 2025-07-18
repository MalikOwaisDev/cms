import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getCaregivers } from "../services/patient";
import { createTraining } from "../services/training";
import {
  BookOpenIcon,
  BackIcon,
  AlignLeftIcon,
  CalendarIcon,
  SendIcon,
  PlusIcon,
  TrashIcon,
} from "../Icons";

const getCarers = async (token) => {
  try {
    const res = await getCaregivers(token);
    return res.data; // Return caregiver data
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error("No caregivers found.");
    }
    throw new Error("Unable to fetch caregivers. Please try again later.");
  }
};
// --- Training Form Page Component ---
export default function TrainingForm() {
  document.title = "New Training | Care Management System";
  const navigate = useNavigate();

  const initialFormState = {
    title: "",
    content: "",
    deadline: "",
    quiz: [],
    assignedTo: [],
  };

  const [form, setForm] = useState(initialFormState);
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) navigate("/login");
    const fetchCaregivers = async () => {
      try {
        const data = await getCarers(token);
        setCaregivers(data);
        setError("");
      } catch (err) {
        setError(err.message || "Something went wrong.");
      }
    };
    fetchCaregivers();
  }, [token, navigate]);

  // --- FORM STATE HANDLERS ---
  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleAssigneeChange = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      assignedTo: checked
        ? [...prev.assignedTo, value]
        : prev.assignedTo.filter((id) => id !== value),
    }));
  };

  // --- QUIZ STATE HANDLERS ---
  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      quiz: [
        ...prev.quiz,
        { question: "", options: ["", "", ""], correctAnswer: "" },
      ],
    }));
  };

  const removeQuestion = (qIndex) => {
    setForm((prev) => ({
      ...prev,
      quiz: prev.quiz.filter((_, index) => index !== qIndex),
    }));
  };

  const handleQuestionChange = (e, qIndex) => {
    const { value } = e.target;
    setForm((prev) => {
      const newQuiz = [...prev.quiz];
      newQuiz[qIndex].question = value;
      return { ...prev, quiz: newQuiz };
    });
  };

  const addOption = (qIndex) => {
    setForm((prev) => {
      const newQuiz = [...prev.quiz];
      newQuiz[qIndex].options.push("");
      return { ...prev, quiz: newQuiz };
    });
  };

  const removeOption = (qIndex, oIndex) => {
    setForm((prev) => {
      const newQuiz = [...prev.quiz];
      // Also clear correctAnswer if the removed option was the correct one
      if (newQuiz[qIndex].correctAnswer === newQuiz[qIndex].options[oIndex]) {
        newQuiz[qIndex].correctAnswer = "";
      }
      newQuiz[qIndex].options = newQuiz[qIndex].options.filter(
        (_, index) => index !== oIndex
      );
      return { ...prev, quiz: newQuiz };
    });
  };

  const handleOptionChange = (e, qIndex, oIndex) => {
    const { value } = e.target;
    setForm((prev) => {
      const newQuiz = [...prev.quiz];
      newQuiz[qIndex].options[oIndex] = value;
      return { ...prev, quiz: newQuiz };
    });
  };

  const handleCorrectAnswerChange = (qIndex, optionValue) => {
    setForm((prev) => {
      const newQuiz = [...prev.quiz];
      newQuiz[qIndex].correctAnswer = optionValue;
      return { ...prev, quiz: newQuiz };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.title || !form.deadline) {
      setError("Title and Deadline are required fields.");
      return;
    }
    // Quiz Validation
    for (const q of form.quiz) {
      if (!q.question) {
        setError("All quiz questions must not be empty.");
        return;
      }
      if (q.options.length < 3) {
        setError(`Question "${q.question}" must have at least 3 options.`);
        return;
      }
      if (q.options.some((opt) => opt.trim() === "")) {
        setError(`All options for question "${q.question}" must be filled.`);
        return;
      }
      if (!q.correctAnswer) {
        setError(
          `A correct answer must be selected for question "${q.question}".`
        );
        return;
      }
    }

    setLoading(true);
    try {
      await createTraining(form, token);

      setSuccess("Training created and assigned successfully!");
      setForm(initialFormState);
      setTimeout(() => {
        setSuccess("");
        navigate("/trainings"); // Redirect to trainings list after success
      }, 2000);
    } catch (err) {
      console.error("Error creating training:", err);
      if (err.response && err.response.status === 403) {
        setError("You are not authorized to create trainings.");
        return;
      }
      setError("Failed to create training. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (window.history.state && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/trainings");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans">
      <Header />

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
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
                Create New Training Module
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Design a training module with content, quizzes, and assignments.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-sm space-y-10"
          >
            {/* --- MODULE DETAILS --- */}
            <fieldset className="space-y-6">
              <legend className="text-xl font-semibold text-[#1D2056] dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
                {" "}
                Module Details{" "}
              </legend>
              <div>
                {" "}
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  {" "}
                  Training Title{" "}
                </label>{" "}
                <div className="relative">
                  {" "}
                  <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                    {" "}
                    <BookOpenIcon size={20} />{" "}
                  </span>{" "}
                  <input
                    id="title"
                    value={form.title}
                    onChange={handleFormChange}
                    placeholder="e.g., Service User Privacy & HIPAA"
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                  />{" "}
                </div>{" "}
              </div>
              <div>
                {" "}
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  {" "}
                  Content / Instructions{" "}
                </label>{" "}
                <div className="relative">
                  {" "}
                  <span className="absolute top-4 left-3 text-slate-400">
                    {" "}
                    <AlignLeftIcon />{" "}
                  </span>{" "}
                  <textarea
                    id="content"
                    value={form.content}
                    onChange={handleFormChange}
                    rows="5"
                    placeholder="Describe the training requirements, link to materials, etc."
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                  ></textarea>{" "}
                </div>{" "}
              </div>
              <div>
                {" "}
                <label
                  htmlFor="deadline"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  {" "}
                  Completion Deadline{" "}
                </label>{" "}
                <div className="relative">
                  {" "}
                  <span className="absolute top-[50%] left-3 -translate-y-1/2 text-slate-400">
                    {" "}
                    <CalendarIcon />{" "}
                  </span>{" "}
                  <input
                    type="date"
                    id="deadline"
                    value={form.deadline}
                    onChange={handleFormChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                  />{" "}
                </div>{" "}
              </div>
            </fieldset>

            {/* --- QUIZ BUILDER --- */}
            <fieldset>
              <legend className="text-xl font-semibold text-[#1D2056] dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
                {" "}
                Quiz Builder{" "}
              </legend>
              <div className="space-y-6">
                {form.quiz.map((q, qIndex) => (
                  <div
                    key={qIndex}
                    className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <label
                        htmlFor={`question-${qIndex}`}
                        className="block text-md font-semibold text-slate-800 dark:text-slate-200"
                      >
                        {" "}
                        Question {qIndex + 1}{" "}
                      </label>
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        {" "}
                        <TrashIcon size={16} />{" "}
                      </button>
                    </div>
                    <input
                      id={`question-${qIndex}`}
                      value={q.question}
                      onChange={(e) => handleQuestionChange(e, qIndex)}
                      placeholder="Enter the quiz question"
                      className="w-full p-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                    />

                    <div className="space-y-3 pt-3">
                      <h4 className="font-semibold text-slate-600 dark:text-slate-300">
                        Options (select correct answer)
                      </h4>
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-answer-${qIndex}`}
                            checked={q.correctAnswer === opt}
                            onChange={() =>
                              handleCorrectAnswerChange(qIndex, opt)
                            }
                            className="h-4 w-4 text-[#FE4982] focus:ring-[#E03A6D] border-slate-400"
                          />
                          <input
                            value={opt}
                            onChange={(e) =>
                              handleOptionChange(e, qIndex, oIndex)
                            }
                            placeholder={`Option ${oIndex + 1}`}
                            className="flex-grow p-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FE4982]"
                          />
                          {q.options.length > 3 && (
                            <button
                              type="button"
                              onClick={() => removeOption(qIndex, oIndex)}
                              className="text-slate-500 hover:text-red-600 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                            >
                              {" "}
                              <TrashIcon size={16} />{" "}
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(qIndex)}
                        className="text-sm font-semibold text-[#FE4982] hover:text-[#E03A6D] flex items-center gap-1"
                      >
                        {" "}
                        <PlusIcon size={16} /> Add Option{" "}
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addQuestion}
                  className="w-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                >
                  <PlusIcon size={16} /> Add Question
                </button>
              </div>
            </fieldset>

            {/* --- ASSIGN CAREGIVERS --- */}
            <fieldset>
              <legend className="text-xl font-semibold text-[#1D2056] dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
                {" "}
                Assign to Caregivers ({form.assignedTo.length} selected){" "}
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {caregivers?.map((c) => (
                  <label
                    key={c._id}
                    htmlFor={`caregiver-${c._id}`}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                      form.assignedTo.includes(c._id)
                        ? "bg-pink-100 dark:bg-pink-900/40 border-pink-300 dark:border-pink-600 ring-2 ring-pink-500 dark:ring-pink-500"
                        : "bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={`caregiver-${c._id}`}
                      value={c._id}
                      checked={form.assignedTo.includes(c._id)}
                      onChange={handleAssigneeChange}
                      className="h-4 w-4 rounded border-gray-300 text-[#FE4982] focus:ring-[#E03A6D]"
                    />
                    <span className="ml-3 font-medium text-slate-700 dark:text-slate-200">
                      {" "}
                      {c.name}{" "}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* --- SUBMIT --- */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              {error && (
                <p className="text-red-500 dark:text-red-400 text-sm text-center font-semibold">
                  {" "}
                  {error}{" "}
                </p>
              )}
              {success && (
                <p className="text-green-600 dark:text-green-400 text-sm text-center font-semibold">
                  {" "}
                  {success}{" "}
                </p>
              )}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                >
                  {" "}
                  Cancel{" "}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-[#FE4982] text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-[#E03A6D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:ring-offset-slate-900 focus:ring-[#FE4982] transition-all disabled:bg-opacity-60"
                >
                  {" "}
                  {loading ? (
                    "Assigning..."
                  ) : (
                    <>
                      {" "}
                      <SendIcon /> Create & Assign{" "}
                    </>
                  )}{" "}
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
