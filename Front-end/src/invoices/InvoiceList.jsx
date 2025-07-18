import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getInvoices, deleteInvoice } from "../services/invoice";
import {
  PlusIcon,
  ChevronRightIcon,
  InvoiceIcon,
  BackIcon,
  TrashIcon,
  EditIcon,
} from "../Icons";

// --- Skeleton Loader: Now responsive, showing card-like placeholders on mobile ---
const TableSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="h-24 sm:h-16 bg-white dark:bg-slate-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4"
      >
        <div className="w-full flex justify-between items-center sm:w-auto sm:block">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/5 sm:w-24"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 sm:hidden"></div>
        </div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 sm:w-1/5"></div>
        <div className="hidden sm:block h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/6"></div>
        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-full self-end sm:self-center"></div>
      </div>
    ))}
  </div>
);

export default function InvoiceList() {
  document.title = "Invoices | Care Management System";
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    getInvoices(token)
      .then((res) => setInvoices(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, navigate]);

  const handleDelete = async () => {
    if (!invoiceToDelete) return;
    try {
      await deleteInvoice(invoiceToDelete, token);
      setInvoices(invoices.filter((inv) => inv.invID !== invoiceToDelete));
    } catch (error) {
      console.error("Failed to delete invoice", error);
      // Optionally, show an error message to the user
    } finally {
      setShowConfirm(false);
      setInvoiceToDelete(null);
    }
  };

  const confirmDeletion = (invID) => {
    setInvoiceToDelete(invID);
    setShowConfirm(true);
  };

  const handleGoBack = () => {
    if (window.history.state && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const StatusBadge = ({ status }) => {
    const paidClasses =
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    const unpaidClasses =
      "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300";
    return (
      <div
        className={`px-3 py-1 text-xs font-semibold rounded-full inline-block capitalize ${
          status === "paid" ? paidClasses : unpaidClasses
        }`}
      >
        {status}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans">
      <Header />

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center mb-8">
          <button
            onClick={handleGoBack}
            className="mr-4 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
            aria-label="Go back"
          >
            <span className="text-slate-600 dark:text-slate-300">
              <BackIcon />
            </span>
          </button>
          <div className="flex-grow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
                Invoices
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Manage and track all Service user invoices.
              </p>
            </div>
            <Link
              to="/invoices/create"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FE4982] text-white font-bold py-2.5 px-5 rounded-lg hover:bg-[#E03A6D] transition-all"
            >
              <PlusIcon /> Create New Invoice
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-2 sm:p-4 rounded-xl shadow-sm">
          {loading ? (
            <TableSkeleton />
          ) : invoices.length > 0 ? (
            <div className="overflow-x-auto">
              {/* --- Responsive Table: Uses standard table on larger screens --- */}
              <table className="w-full text-left hidden sm:table">
                <thead className="border-b-2 border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Invoice ID
                    </th>
                    <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Service User
                    </th>
                    <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400 hidden md:table-cell">
                      Issue Date
                    </th>
                    <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Amount
                    </th>
                    <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400 text-center">
                      Status
                    </th>
                    <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400 text-center">
                      Actions
                    </th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr
                      key={inv.invID}
                      className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="p-4 font-mono text-sm text-[#1D2056] dark:text-pink-400 font-semibold">
                        <Link
                          to={`/invoices/${inv.invID}`}
                          className="hover:underline"
                        >
                          {inv.invID.replace("inv_", "#")}
                        </Link>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-200 font-semibold">
                        {inv.patient?.name}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 hidden md:table-cell">
                        {new Date(inv.issuedDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-200 font-semibold">
                        £{inv.totalAmount.toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="p-4 text-center space-x-2">
                        <div className="flex items-center justify-center space-x-2">
                          {" "}
                          <Link
                            to={`/invoices/edit/${inv.invID}`}
                            className="inline-block text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 p-2 rounded-full transition-colors"
                            title="Edit Invoice"
                          >
                            <EditIcon size={20} />
                          </Link>
                          <button
                            onClick={() => confirmDeletion(inv.invID)}
                            className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-full transition-colors"
                            title="Delete Invoice"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          to={`/invoices/${inv.invID}`}
                          className="text-slate-400 hover:text-[#FE4982] dark:hover:text-pink-400"
                        >
                          <ChevronRightIcon />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* --- Responsive Card Layout: Shows on small screens --- */}
              <div className="block sm:hidden space-y-4">
                {invoices.map((inv) => (
                  <div
                    key={inv.invID}
                    className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          to={`/invoices/${inv.invID}`}
                          className="font-mono text-md font-bold text-[#1D2056] dark:text-pink-400 hover:underline"
                        >
                          {inv.invID.replace("inv_", "#")}
                        </Link>
                        <p className="text-slate-700 dark:text-slate-200 font-semibold text-lg">
                          {inv.patient?.name}
                        </p>
                      </div>
                      <StatusBadge status={inv.status} />
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Amount:{" "}
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            £{inv.totalAmount.toFixed(2)}
                          </span>
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Due: {new Date(inv.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Link
                          to={`/invoices/edit/${inv.invID}`}
                          className=" p-2 text-slate-500 dark:text-slate-400 hover:text-blue-500 rounded-full"
                        >
                          <EditIcon />
                        </Link>
                        <button
                          onClick={() => confirmDeletion(inv.invID)}
                          className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 rounded-full"
                        >
                          <TrashIcon />
                        </button>
                        <Link
                          to={`/invoices/${inv.invID}`}
                          className="p-2 text-slate-500 dark:text-slate-400 hover:text-[#FE4982]"
                        >
                          <ChevronRightIcon />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center flex flex-col items-center py-16">
              <span className="text-slate-400 dark:text-slate-500">
                <InvoiceIcon />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-200">
                No Invoices Found
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Get started by creating a new invoice.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* --- Deletion Confirmation Modal --- */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Confirm Deletion
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Are you sure you want to delete invoice{" "}
              <strong>#{invoiceToDelete?.replace("inv_", "")}</strong>? This
              action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
