import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getInvoiceById, updateInvoice } from "../services/invoice";
import {
  PlusIcon,
  TrashIcon,
  SaveIcon,
  BackIcon,
  AlertTriangleIcon,
} from "../Icons";

// --- Loading Skeleton Component for the Edit Page ---
const InvoiceLoader = () => (
  <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
    <Header />
    <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 sm:h-9 w-3/5 rounded-lg bg-slate-300 dark:bg-slate-700"></div>
          <div className="h-5 sm:h-6 w-4/5 rounded-lg bg-slate-200 dark:bg-slate-700 mt-3"></div>
        </div>

        {/* Form Skeleton */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-8 rounded-xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-pulse">
            <div className="md:col-span-2 space-y-2">
              <div className="h-4 w-16 rounded bg-slate-300 dark:bg-slate-600"></div>
              <div className="h-12 w-full rounded-lg bg-slate-200 dark:bg-slate-700"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 rounded bg-slate-300 dark:bg-slate-600"></div>
              <div className="h-12 w-full rounded-lg bg-slate-200 dark:bg-slate-700"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 rounded bg-slate-300 dark:bg-slate-600"></div>
              <div className="h-12 w-full rounded-lg bg-slate-200 dark:bg-slate-700"></div>
            </div>
          </div>

          {/* Services Skeleton */}
          <div className="space-y-4 animate-pulse">
            <div className="h-6 w-40 rounded-lg bg-slate-300 dark:bg-slate-600 border-b border-transparent pb-2"></div>
            {/* A single responsive skeleton item for services */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="h-12 w-full rounded-lg bg-slate-200 dark:bg-slate-700"></div>
              <div className="h-12 w-full md:w-36 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
              <div className="h-12 w-12 rounded-lg bg-slate-200 dark:bg-slate-700 self-start md:self-center"></div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="h-12 w-full rounded-lg bg-slate-200 dark:bg-slate-700"></div>
              <div className="h-12 w-full md:w-36 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
              <div className="h-12 w-12 rounded-lg bg-slate-200 dark:bg-slate-700 self-start md:self-center"></div>
            </div>
            <div className="h-10 w-36 rounded-lg bg-slate-200 dark:bg-slate-700 mt-2"></div>
          </div>

          {/* Total and Button Skeleton */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
            <div className="h-10 w-48 rounded-lg bg-slate-300 dark:bg-slate-600"></div>
            <div className="h-12 w-full sm:w-40 rounded-lg bg-slate-300 dark:bg-slate-600"></div>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

// --- Component to display when an invoice is not found ---
const InvoiceNotFound = ({ invoiceId }) => (
  <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
    <Header />
    <main className="flex-grow container mx-auto p-4 flex items-center justify-center">
      <div className="text-center bg-white dark:bg-slate-800 p-8 sm:p-12 rounded-xl shadow-md">
        <div className="flex justify-center mb-4 text-yellow-500">
          <AlertTriangleIcon size={48} />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
          Invoice Not Found
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">
          We couldn't find any invoice with the ID{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            #{invoiceId}
          </span>
          . It might have been deleted or the link may be incorrect.
        </p>
        <Link
          to="/invoices"
          className="mt-6 inline-block bg-[#FE4982] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#E03A6D] transition-colors"
        >
          Back to All Invoices
        </Link>
      </div>
    </main>
    <Footer />
  </div>
);

// --- Main Edit Invoice Page Component ---
export default function EditInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- State Management ---
  const [invoice, setInvoice] = useState(null);
  const [services, setServices] = useState([]);
  const [invoiceExists, setInvoiceExists] = useState(true);

  // Helper state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem("token");

  // Set page title dynamically
  useEffect(() => {
    document.title = invoice
      ? `Edit #${invoice.invID} | Care Management`
      : `Edit Invoice | Care Management`;
  }, [invoice]);

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const invoiceRes = await getInvoiceById(id, token);
        if (invoiceRes && invoiceRes.data) {
          setInvoice(invoiceRes.data);
          // Ensure services is always an array
          setServices(invoiceRes.data.services || []);
          setInvoiceExists(true);
        } else {
          setInvoiceExists(false);
        }
      } catch (err) {
        console.error("Error fetching invoice:", err);
        setError("Could not fetch invoice data. Please try again.");
        setInvoiceExists(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token, navigate]);

  // --- Event Handlers for Services ---
  const handleAddService = () => {
    setServices([...services, { description: "", amount: "" }]);
  };

  const handleRemoveService = (index) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...services];
    updatedServices[index][field] = value;
    setServices(updatedServices);
  };

  const handleDateChange = (field, value) => {
    setInvoice({ ...invoice, [field]: value });
  };

  // --- Memoized Total Calculation ---
  const totalAmount = useMemo(
    () => services.reduce((total, s) => total + (Number(s.amount) || 0), 0),
    [services]
  );

  // --- Form Submission Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (services.some((s) => !s.description || !s.amount)) {
      setError("Please fill all service details.");
      return;
    }
    setSaving(true);
    try {
      const invoiceData = {
        ...invoice, // Send the whole invoice object
        services: services.map((s) => ({ ...s, amount: Number(s.amount) })),
        totalAmount: totalAmount,
      };
      await updateInvoice(id, invoiceData, token);
      setSuccess("Invoice updated successfully!");
      setTimeout(() => {
        setSuccess("");
        navigate(`/invoices/${id}`);
      }, 2000);
    } catch (err) {
      console.error("Error updating invoice:", err);
      setError("Failed to update invoice. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleGoBack = () => {
    if (window.history.state && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/invoices");
    }
  };

  // --- Conditional Rendering ---
  if (loading) {
    return <InvoiceLoader />;
  }

  if (!invoiceExists) {
    return <InvoiceNotFound invoiceId={id} />;
  }

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
                Edit Invoice #{invoice?.invID}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
                Update the details for this invoice.
              </p>
            </div>
          </div>

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
                  Service User
                </label>
                <input
                  id="patient"
                  type="text"
                  value={invoice.patient?.name || "N/A"}
                  disabled
                  className="w-full p-3 bg-slate-200 dark:bg-slate-700/50 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-70 disabled:cursor-not-allowed"
                />
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
                  value={(invoice.issuedDate || "").split("T")[0]}
                  onChange={(e) =>
                    handleDateChange("issuedDate", e.target.value)
                  }
                  className="w-full p-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
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
                  value={(invoice.dueDate || "").split("T")[0]}
                  onChange={(e) => handleDateChange("dueDate", e.target.value)}
                  className="w-full p-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                />
              </div>
            </div>

            {/* --- Services Section --- */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
                Services Rendered
              </h2>
              {services.map((service, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row gap-4 items-center"
                >
                  <input
                    type="text"
                    placeholder="Service Description"
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
                    className="w-full md:w-40 p-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4982]"
                    required
                    min="0"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveService(index)}
                    className="text-red-500 hover:text-red-700 p-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors self-start md:self-center"
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

            {/* --- Total and Submit Button --- */}
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
                disabled={saving}
                className="w-full sm:w-auto bg-[#FE4982] text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-[#E03A6D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:ring-offset-slate-900 focus:ring-[#FE4982] transition-all disabled:bg-opacity-60 disabled:cursor-wait"
              >
                {saving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon /> Save Changes
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
