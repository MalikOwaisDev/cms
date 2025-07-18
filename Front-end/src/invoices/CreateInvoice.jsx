import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { createInvoice } from "../services/invoice";
import { getPatients } from "../services/patient";
import { PlusIcon, TrashIcon, SendIcon, BackIcon } from "../Icons";

// --- Helper function to get a default due date (10 days from now) ---
const getDefaultDueDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 10);
  return date.toISOString().split("T")[0];
};

// --- Main Create Invoice Page Component ---
export default function CreateInvoice() {
  document.title = "New Invoice | Care Management System";

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // --- State Management ---
  const patientId = searchParams.get("patientId");
  const [pID, setpID] = useState("");
  const [services, setServices] = useState([{ description: "", amount: "" }]);
  const [patients, setPatients] = useState([]);
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(getDefaultDueDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem("token");

  // --- Effects ---
  useEffect(() => {
    // Redirect if not logged in
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch patients from the server
    getPatients(token)
      .then((res) => setPatients(res.data))
      .catch((err) => {
        console.error("Error fetching service users:", err);
        setError("Could not fetch service users. Please refresh the page.");
      });

    // Set patient ID from URL search params if available
    if (patientId) {
      setpID(patientId);
    }
  }, [token, navigate, patientId]);

  // --- Event Handlers ---

  // Adds a new empty service line to the form
  const handleAddService = () => {
    setServices([...services, { description: "", amount: "" }]);
  };

  // Removes a service line by its index
  const handleRemoveService = (index) => {
    setServices(services.filter((_, i) => i !== index));
  };

  // Updates a specific field (description or amount) for a service line
  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...services];
    updatedServices[index][field] = value;
    setServices(updatedServices);
  };

  // Navigate back to the previous page or a default page
  const handleGoBack = () => {
    if (window.history.state && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/invoices"); // Default fallback
    }
  };

  // Handles the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic validation
    if (!pID || services.some((s) => !s.description || !s.amount)) {
      setError("Please select a service users and fill all service details.");
      return;
    }

    setLoading(true);
    try {
      const invoiceData = {
        patient: pID,
        services: services.map((s) => ({ ...s, amount: Number(s.amount) })),
        totalAmount: totalAmount,
        issuedDate: invoiceDate,
        dueDate: dueDate,
        status: "unpaid",
      };
      await createInvoice(invoiceData, token);
      setSuccess("Invoice created successfully!");

      // Redirect after a short delay to show the success message
      setTimeout(() => {
        navigate("/invoices");
      }, 2000);
    } catch (err) {
      console.error("Invoice creation failed:", err);
      setError("Failed to create invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Memoized Calculation ---

  // Calculates the total amount whenever the services list changes
  const totalAmount = useMemo(
    () => services.reduce((total, s) => total + (Number(s.amount) || 0), 0),
    [services]
  );

  // --- Render Method ---
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans">
      <Header />

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* --- Page Header --- */}
          <div className="flex items-center mb-6">
            <button
              onClick={handleGoBack}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Go back"
            >
              <span className="text-slate-600 dark:text-slate-300">
                <BackIcon />
              </span>
            </button>
            <div className="ml-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
                Create New Invoice
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
                Fill in the details to generate an invoice.
              </p>
            </div>
          </div>

          {/* --- Invoice Form --- */}
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-8 rounded-xl shadow-sm"
          >
            {/* --- Patient and Date Section --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="md:col-span-2">
                <label
                  htmlFor="patient"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Service Users
                </label>
                <div className="relative">
                  <select
                    id="patient"
                    value={pID}
                    onChange={(e) => setpID(e.target.value)}
                    className="w-full p-3 appearance-none bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                    required
                  >
                    <option value="" disabled>
                      Select a Service User
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
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label
                  htmlFor="invoiceDate"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Issue Date
                </label>
                <input
                  type="date"
                  id="invoiceDate"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full p-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                  required
                />
              </div>
            </div>

            {/* --- Services Section --- */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
                Services
              </h2>
              {services.map((service, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-[1fr_150px_auto] gap-4 items-center"
                >
                  <input
                    type="text"
                    placeholder="Service Description (e.g., 'Physical Therapy')"
                    value={service.description}
                    onChange={(e) =>
                      handleServiceChange(index, "description", e.target.value)
                    }
                    className="w-full p-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={service.amount}
                    onChange={(e) =>
                      handleServiceChange(index, "amount", e.target.value)
                    }
                    className="w-full p-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                    required
                    min="0"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveService(index)}
                    className="text-red-500 hover:text-red-700 p-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors justify-self-start md:justify-self-center"
                    aria-label={`Remove service ${index + 1}`}
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddService}
                className="flex items-center gap-2 text-[#1D2056] dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <PlusIcon /> Add Service Line
              </button>
            </div>

            {/* --- Total and Submission Section --- */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-baseline gap-3">
                <span className="text-xl font-medium text-slate-600 dark:text-slate-400">
                  Total:
                </span>
                <span className="text-3xl font-bold text-[#1D2056] dark:text-slate-100">
                  £{totalAmount.toFixed(2)}
                </span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-[#FE4982] text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-[#E03A6D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:ring-offset-slate-900 focus:ring-[#FE4982] transition-all disabled:bg-opacity-60"
              >
                {loading ? (
                  "Creating..."
                ) : (
                  <>
                    <SendIcon /> Submit Invoice
                  </>
                )}
              </button>
            </div>

            {/* --- Status Messages --- */}
            {error && (
              <p className="text-red-500 dark:text-red-400 text-sm text-center mt-4">
                {error}
              </p>
            )}
            {success && (
              <p className="text-green-600 dark:text-green-400 text-sm text-center mt-4">
                {success}
              </p>
            )}
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
