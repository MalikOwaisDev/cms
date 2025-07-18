import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getTraining, markTrainingComplete } from "../services/training";
import {
  BookOpenIcon,
  BackIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  SearchXIcon,
} from "../Icons";

const TrainingDetailSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-7 sm:h-8 bg-slate-200 dark:bg-slate-700 rounded-md w-2/3 mb-4"></div>
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/3 mb-8"></div>
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md mb-8">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-5"></div>
      <div className="space-y-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg"
          ></div>
        ))}
      </div>
    </div>
  </div>
);

export default function TrainingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (training?.title) {
      document.title = `${training.title} | Care Management System`;
    } else {
      document.title = "Training | Care Management System";
    }
  }, [training]);

  useEffect(() => {
    if (!token || !id) {
      navigate("/login");
      return;
    }
    setLoading(true);
    getTraining(id, token)
      .then((res) => setTraining(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, token, navigate]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    training.quiz.forEach((q) => {
      if (answers[q._id] === q.correctAnswer) {
        correctCount++;
      }
    });
    setScore((correctCount / training.quiz.length) * 100);
    setSubmitted(true);
  };

  const handleMarkComplete = async () => {
    setIsCompleting(true);
    try {
      await markTrainingComplete(training._id, token);
      navigate("/trainings");
    } catch (error) {
      console.error("Failed to submit training", error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleGoBack = () => {
    if (window.history.state && window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/trainings");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <TrainingDetailSkeleton />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!training) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <div className="max-w-xl w-full text-center">
            <div className="flex flex-col bg-white dark:bg-slate-800 p-8 sm:p-12 rounded-2xl shadow-md">
              <span className="mx-auto text-slate-400 dark:text-slate-500">
                <SearchXIcon />
              </span>
              <h2 className="mt-6 text-2xl font-bold text-slate-800 dark:text-slate-100">
                Training Not Found
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Sorry, we couldn't find the training module you're looking for.
                It might have been moved or deleted.
              </p>
              <Link
                to="/trainings"
                className="mt-8 inline-block bg-[#FE4982] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#E03A6D] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-800 focus:ring-[#FE4982]"
              >
                Back to All Trainings
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const allQuestionsAnswered =
    Object.keys(answers).length === training.quiz.length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
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
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-2">
                <CalendarIcon />
                <span>
                  Deadline:{" "}
                  {new Date(training.deadline).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                {training.title}
              </h1>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1D2056] dark:text-slate-200 flex items-center gap-3 mb-4">
              <BookOpenIcon /> Module Content
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {training.content}
            </p>
          </div>

          {training.quiz && training.quiz.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1D2056] dark:text-slate-200 mb-6">
                Quiz
              </h2>
              <div className="space-y-8">
                {training.quiz.map((q, index) => (
                  <div key={q._id}>
                    <p className="font-semibold text-lg text-slate-800 dark:text-slate-200 mb-4">
                      {index + 1}. {q.question}
                    </p>
                    <div className="space-y-3">
                      {q.options.map((option, oIndex) => {
                        const isSelected = answers[q._id] === option;
                        const isCorrect = q.correctAnswer === option;
                        let optionStyle =
                          "border-slate-300 dark:border-slate-600 hover:border-[#FE4982] dark:hover:border-[#FE4982] hover:bg-pink-50 dark:hover:bg-pink-900/20";
                        if (submitted) {
                          if (isCorrect)
                            optionStyle =
                              "border-green-500 bg-green-50 dark:bg-green-500/20 ring-2 ring-green-500";
                          else if (isSelected && !isCorrect)
                            optionStyle =
                              "border-red-500 bg-red-50 dark:bg-red-500/20 ring-2 ring-red-500";
                        }

                        return (
                          <label
                            key={oIndex}
                            className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${optionStyle}`}
                          >
                            <input
                              type="radio"
                              name={q._id}
                              value={option}
                              onChange={(e) =>
                                handleAnswerChange(q._id, e.target.value)
                              }
                              disabled={submitted}
                              className="w-5 h-5 text-[#FE4982] focus:ring-[#E03A6D] disabled:opacity-50"
                            />
                            <span className="flex-grow text-slate-700 dark:text-slate-300">
                              {option}
                            </span>
                            {submitted && isCorrect && (
                              <span className="text-green-500 ml-auto">
                                <CheckCircleIcon />
                              </span>
                            )}
                            {submitted && isSelected && !isCorrect && (
                              <span className="text-red-500 ml-auto">
                                <XCircleIcon />
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {!submitted ? (
                // --- RESPONSIVE Submit Button ---
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={!allQuestionsAnswered}
                    className="w-full sm:w-auto bg-[#FE4982] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#E03A6D] transition-colors disabled:bg-opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Quiz
                  </button>
                </div>
              ) : (
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
                  <h3 className="text-2xl dark:text-slate-200 text-slate-800 font-bold">
                    Your Score:
                    <span
                      className={
                        score >= 80 ? "text-green-500" : "text-red-500"
                      }
                    >
                      {" "}
                      {score.toFixed(0)}%
                    </span>
                  </h3>
                  {score >= 80 ? (
                    <>
                      <p className="text-green-600 dark:text-green-400 mt-2">
                        Congratulations! You have passed the quiz.
                      </p>
                      {/* --- RESPONSIVE Completion Button --- */}
                      <button
                        onClick={handleMarkComplete}
                        disabled={isCompleting}
                        className="w-full sm:w-auto mt-6 bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors disabled:bg-opacity-50"
                      >
                        {isCompleting
                          ? "Completing..."
                          : "Mark as Complete & Finish"}
                      </button>
                    </>
                  ) : (
                    <p className="text-red-600 dark:text-red-400 mt-2">
                      You did not pass the quiz. Please review the material and
                      try again later.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
