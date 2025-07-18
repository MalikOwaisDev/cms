import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getPatient } from "../services/patient";
import { useUser } from "../hooks/useUser";
import {
  EditIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InvoiceIcon,
  AlertTriangleIcon, // Kept for modal in case of future use
} from "../Icons";

const PatientDetailsSkeleton = () => (
  <div className="animate-pulse max-w-4xl mx-auto">
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-sm">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
        <div className="w-full space-y-3 pt-2 text-center sm:text-left">
          <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md mx-auto sm:mx-0"></div>
          <div className="h-5 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-md mx-auto sm:mx-0"></div>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div className="h-48 bg-white dark:bg-slate-800 rounded-xl shadow-sm"></div>
      <div className="h-48 bg-white dark:bg-slate-800 rounded-xl shadow-sm"></div>
    </div>
    <div className="h-32 mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm"></div>
  </div>
);

const InvoiceSkeleton = () => (
  <div className="animate-pulse space-y-2 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-lg flex items-center justify-between p-4 space-x-4"
      >
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-1/3"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-1/4"></div>
        </div>
        <div className="w-16 h-5 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
      </div>
    ))}
  </div>
);

const InvoicesList = ({ invoices }) => {
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
      case "unpaid":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
      {invoices.length > 0 ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {invoices.map((invoice) => (
            <div
              key={invoice._id}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-3 group"
            >
              <div className="flex-grow">
                <p className="font-bold text-slate-800 dark:text-slate-100">{`Invoice #${invoice.invID}`}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Due: {new Date(invoice.dueDate).toLocaleDateString()}
                </p>
              </div>
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4">
                <div className="text-slate-800 dark:text-slate-200 font-semibold">
                  £{invoice.totalAmount.toFixed(2)}
                </div>
                <div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                      invoice.status
                    )}`}
                  >
                    {invoice.status}
                  </span>
                </div>
                <Link
                  to={`/invoices/${invoice.invID}`}
                  className="text-slate-400 group-hover:text-[#FE4982] dark:hover:text-white p-2"
                  title="View Full Invoice"
                >
                  <ChevronRightIcon />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-500 dark:text-slate-400">
            No invoices found for this service user.
          </p>
        </div>
      )}
    </div>
  );
};

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userQuery } = useUser();
  const { data: user } = userQuery;
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = patient
      ? `Service User ${patient.name} | Care Management`
      : "Service User Details | Care Management";
  }, [patient]);

  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [invoicesError, setInvoicesError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id || !token) {
        navigate("/patients");
        return;
      }

      setLoading(true);
      setInvoicesLoading(true);

      try {
        const patientResponse = await getPatient(id, token);
        setPatient(patientResponse.data);

        // This assumes the patient object contains their invoices
        if (patientResponse.data.invoices) {
          setInvoices(patientResponse.data.invoices);
        }
      } catch (error) {
        console.error("Error fetching service user data:", error);
        setInvoicesError(
          "Failed to load service user details. Please try again."
        );
        navigate("/patients");
      } finally {
        setLoading(false);
        setInvoicesLoading(false);
      }
    };

    fetchDetails();
  }, [id, token, navigate]);

  const handleGoBack = () => {
    if (window.history.state && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/patients");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 max-w-4xl mx-auto">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeftIcon />
            Back to Service Users
          </button>
        </div>

        {loading ? (
          <PatientDetailsSkeleton />
        ) : (
          patient && (
            <div className="max-w-4xl mx-auto">
              {/* --- Patient Header Card --- */}
              <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                  <div className="relative flex-shrink-0">
                    <span className="flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 text-4xl sm:text-5xl font-bold text-white capitalize rounded-full object-cover border-4 border-white dark:border-slate-700 bg-[#E5447D] shadow-md">
                      {patient.name
                        ? patient.name.charAt(0).toUpperCase()
                        : "M"}
                    </span>
                  </div>
                  <div className="w-full text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
                        {patient.name}
                      </h1>
                      {user.role === "admin" && (
                        <Link
                          to={`/patients/edit/${patient.pID}`}
                          className="mt-2 sm:mt-0 text-sm font-semibold text-[#FE4982] hover:underline flex items-center gap-1.5"
                        >
                          <EditIcon /> Edit Profile
                        </Link>
                      )}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      {patient.diagnosis}
                    </p>
                    <div className="mt-4 flex justify-center sm:justify-start items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                      <span>
                        <strong>Age:</strong> {patient.age}
                      </span>
                      <span className="h-4 border-l border-slate-200 dark:border-slate-600"></span>
                      <span>
                        <strong>Gender:</strong> {patient.gender}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Details and Actions Grid --- */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
                      Contact & Address
                    </h3>
                    <dl className="space-y-4 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500 dark:text-slate-400">
                          Phone
                        </dt>
                        <dd className="text-slate-800 dark:text-slate-200 font-medium">
                          {patient.phone}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500 dark:text-slate-400">
                          Email
                        </dt>
                        <dd className="text-slate-800 dark:text-slate-200 font-medium">
                          {patient.email}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500 dark:text-slate-400">
                          Address
                        </dt>
                        <dd className="text-slate-800 dark:text-slate-200 font-medium text-right">{`${patient.address.street}, ${patient.address.city}, ${patient.address.country}`}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
                      Care Notes
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      {patient.notes || "No additional notes provided."}
                    </p>
                  </div>
                </div>
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
                      Admin Info
                    </h3>
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-slate-500 dark:text-slate-400">
                          Assigned Caregiver
                        </dt>
                        <dd className="text-slate-800 dark:text-slate-200 font-medium">
                          {patient?.assignedCaregiver?.name}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 pb-3 mb-4">
                      Quick Actions
                    </h3>
                    <div className="flex flex-col gap-3">
                      {user && user.role === "admin" && (
                        <Link
                          to={`/invoices/create?patientId=${patient._id}`}
                          className="w-full text-center bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                        >
                          Create Invoice
                        </Link>
                      )}
                      <Link
                        to={`/wellness/plans/create?patientId=${patient._id}`}
                        className="w-full text-center bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                      >
                        New Care Plan
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Invoice Section --- */}
              {user && user.role === "admin" && (
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="dark:text-slate-200 text-slate-800">
                      <InvoiceIcon size={24} />
                    </span>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                      Service User Invoices
                    </h2>
                  </div>
                  {invoicesLoading ? (
                    <InvoiceSkeleton />
                  ) : invoicesError ? (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg text-center">
                      <p>{invoicesError}</p>
                    </div>
                  ) : (
                    <InvoicesList invoices={invoices} />
                  )}
                </div>
              )}
            </div>
          )
        )}
      </main>
      <Footer />
    </div>
  );
}
