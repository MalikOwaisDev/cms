import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getInvoiceById, markInvoicePaid } from "../services/invoice";
import {
  ChevronLeftIcon,
  PrintIcon,
  DownloadIcon,
  CheckCircleIcon,
} from "../Icons";

const InvoiceSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm animate-pulse">
    <div className="flex justify-between items-start mb-8">
      <div>
        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mt-2"></div>
      </div>
      <div className="h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
    </div>
    <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded mt-8"></div>
    <div className="flex justify-end mt-8">
      <div className="h-12 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
    </div>
  </div>
);

const InvoicePrintLayout = ({ invoice }) => (
  <div className="bg-white text-gray-800 font-sans p-10 w-[800px] shadow-lg border border-gray-200 rounded-lg">
    {/* Header Section */}
    <div className="flex justify-between items-start pb-8 border-b-2 border-gray-200 mb-8">
      <div className="flex flex-col">
        <img className="w-48 mb-4" src="/logo3.png" alt="Company Logo" />
        <h2 className="text-2xl font-bold text-gray-900">Mindful Trust</h2>
        <p className="text-gray-600">
          CeeGee House Firstfloor College <br /> Road Harrow Weald HA3 4EF
        </p>
        <p className="text-gray-600">info@mindfultrust.co.uk</p>
      </div>
      <div className="text-right">
        <h1 className="text-5xl font-extrabold text-gray-800">INVOICE</h1>
        <p className="text-gray-500 mt-2">
          Invoice #: <span className="font-semibold">{invoice.invID}</span>
        </p>
      </div>
    </div>

    {/* Billing and Invoice Details Section */}
    <div className="flex justify-between mb-10">
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Billed To</h3>
        <p className="font-bold text-lg text-gray-900">
          {invoice.patient.name}
        </p>
        <p className="text-gray-600">
          {invoice.patient.address.street}, {invoice.patient.address.city},{" "}
          <br />
          {invoice.patient.address?.state},{" "}
          {invoice.patient.address?.postalCode}, <br />
          {invoice.patient.address.country}
        </p>
      </div>
      <div className="text-right">
        <p className="mb-1">
          <span className="font-semibold text-gray-600">Issue Date:</span>{" "}
          <span className="text-gray-800">
            {new Date(invoice.issuedDate).toLocaleDateString()}
          </span>
        </p>
        <p>
          <span className="font-semibold text-gray-600">Due Date:</span>{" "}
          <span className="text-gray-800">
            {new Date(invoice.dueDate).toLocaleDateString()}
          </span>
        </p>
        <div className="mt-4">
          <p
            className={`font-bold text-xl ${
              invoice.status === "paid" ? "text-green-600" : "text-red-600"
            }`}
          >
            Status: {invoice.status.toUpperCase()}
          </p>
        </div>
      </div>
    </div>

    {/* Services Table */}
    <div className="mb-10">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-100 border-b-2 border-gray-200">
          <tr>
            <th className="p-4 font-semibold text-gray-700">
              Service Description
            </th>
            <th className="p-4 font-semibold text-gray-700 text-right">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.services.map((s, idx) => (
            <tr key={idx} className="border-b border-gray-100">
              <td className="p-4 text-gray-800">{s.description}</td>
              <td className="p-4 text-right text-gray-800">
                £{s.amount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Total Section */}
    <div className="flex justify-end mb-12">
      <div className="w-full max-w-sm space-y-3">
        <div className="flex justify-between text-lg">
          <span className="text-gray-600">Subtotal:</span>
          <span className="text-gray-800">
            £{invoice.totalAmount.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-lg">
          <span className="text-gray-600">Tax (0%):</span>
          <span className="text-gray-800">£0.00</span>
        </div>
        <div className="flex justify-between font-bold text-2xl border-t-2 border-gray-300 pt-3 mt-3">
          <span className="text-gray-900">Total:</span>
          <span className="text-gray-900">
            £{invoice.totalAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="text-center text-sm text-gray-500 pt-6 border-t border-gray-200">
      <p className="font-semibold">Thank you for your business!</p>
      <p>Please contact us with any questions regarding this invoice.</p>
    </div>
  </div>
);

// --- Simplified Print Styles ---
const PrintStyles = () => (
  <style type="text/css" media="print">
    {`
      @page { size: auto; margin: 0; }
      body { margin: 0; }
      .no-print { display: none !important; }
      .page-to-print { display: block !important; }
    `}
  </style>
);

export default function InvoiceDetails() {
  const { id } = useParams();
  document.title = `Invoice ${id} | Care Management System`;
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const token = localStorage.getItem("token");
  const printRef = useRef();

  useEffect(() => {
    if (!id || !token) {
      navigate("/login"); // Redirect to login if no id or token
      return;
    }

    const fetchInvoice = async () => {
      setLoading(true); // Show loading state
      try {
        const res = await getInvoiceById(id, token); // Fetch invoice data
        setInvoice(res.data); // Set invoice data to state
      } catch (err) {
        console.error("Error fetching invoice:", err); // Log error for debugging
        navigate("/invoices"); // Redirect to invoices page on error
      } finally {
        setLoading(false); // Hide loading state
      }
    };

    fetchInvoice(); // Call fetchInvoice when id or token changes
  }, [id, token, navigate]); // Dependencies: re-run effect if id, token, or navigate changes

  const handleMarkPaid = async () => {
    setLoading(true);
    try {
      await markInvoicePaid(id, token);
      const updated = await getInvoiceById(id, token);
      setInvoice(updated.data);
    } catch (err) {
      console.error("Failed to mark as paid", err);
    } finally {
      setLoading(false);
    }
  };

  // --- FINAL, ROBUST PDF DOWNLOAD HANDLER ---
  const handleDownloadPdf = async () => {
    const input = printRef.current;
    if (!input) {
      console.error("PDF container ref is not available.");
      return;
    }

    setIsDownloading(true);

    // 1. Apply temporary styles to render the element off-screen
    input.style.display = "block";
    input.style.position = "fixed";
    input.style.top = "-10000px"; // Position it far above the visible viewport
    input.style.left = "0px";

    // 2. Give the browser a moment to paint the new layout
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      // 3. Capture the element
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff", // Important for a non-transparent background
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${invoice.invID}.pdf`);
    } catch (error) {
      console.error("An error occurred during PDF generation:", error);
      alert("Sorry, an error occurred while generating the PDF.");
    } finally {
      // 4. Always clean up and hide the element again
      input.style.display = "none";
      input.style.position = "";
      input.style.top = "";
      input.style.left = "";
      setIsDownloading(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const paidClasses =
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    const unpaidClasses =
      "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300";
    const baseClasses = "px-3 py-1.5 text-sm font-semibold rounded-full";
    return (
      <div
        className={`${baseClasses} ${
          status === "paid" ? paidClasses : unpaidClasses
        }`}
      >
        {status}
      </div>
    );
  };

  const handleGoBack = () => {
    if (window.history.state && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/invoices");
    }
  };

  return (
    <>
      {/* We hide this with a simple `hidden` class now */}
      <div className="hidden page-to-print" ref={printRef}>
        {invoice && <InvoicePrintLayout invoice={invoice} />}
      </div>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans no-print">
        <Header />

        <PrintStyles />

        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button
                onClick={handleGoBack}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeftIcon />
                Back
              </button>
            </div>
            {loading && !invoice ? (
              <InvoiceSkeleton />
            ) : (
              invoice && (
                <>
                  <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 lg:p-10 rounded-xl shadow-sm">
                    {/* ----- Invoice Header ----- */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                      <div>
                        <h1 className="text-4xl font-bold text-[#1D2056] dark:text-slate-100">
                          INVOICE
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-mono">
                          #{invoice.invID}
                        </p>
                      </div>
                      <StatusBadge status={invoice.status} />
                    </div>

                    {/* ----- Patient and Details ----- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10 border-t border-slate-100 dark:border-slate-700 pt-8">
                      <div>
                        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Billed To
                        </h2>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {invoice.patient.name}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          {" "}
                          {invoice.patient.address.street},{" "}
                          {invoice.patient.address.city},{" "}
                          {invoice.patient.address?.state},{" "}
                          {invoice.patient.address?.postalCode},{" "}
                          {invoice.patient.address.country}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Details
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300">
                          <strong>Issue Date:</strong>{" "}
                          {new Date(invoice.issuedDate).toLocaleDateString()}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          <strong>Due Date:</strong>{" "}
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* ----- Services Table ----- */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                          <tr className="border-b-2 border-slate-100 dark:border-slate-700">
                            <th className="p-3">Service Description</th>
                            <th className="p-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {invoice.services.map((s, idx) => (
                            <tr key={idx}>
                              <td className="p-3 text-slate-700 dark:text-slate-300">
                                {s.description}
                              </td>
                              <td className="p-3 text-right text-slate-700 dark:text-slate-300">
                                £{s.amount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* ----- Totals ----- */}
                    <div className="flex justify-end mt-8">
                      <div className="w-full max-w-sm space-y-3">
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                          <p>Subtotal</p>
                          <p>£{invoice.totalAmount.toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                          <p>Tax (0%)</p>
                          <p>£0.00</p>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-[#1D2056] dark:text-slate-100 border-t border-slate-200 dark:border-slate-700 pt-3 mt-3 !">
                          <p>Total Amount</p>
                          <p>£{invoice.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ----- Action Buttons ----- */}
                  <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                    >
                      <PrintIcon /> Print
                    </button>
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isDownloading}
                      className="flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all disabled:opacity-60"
                    >
                      <DownloadIcon />{" "}
                      {isDownloading ? "Downloading..." : "Download PDF"}
                    </button>
                    {invoice.status === "unpaid" && (
                      <button
                        onClick={handleMarkPaid}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-[#FE4982] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#E03A6D] transition-all disabled:opacity-60"
                      >
                        <CheckCircleIcon />
                        {loading ? "Processing..." : "Mark as Paid"}
                      </button>
                    )}
                  </div>
                </>
              )
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
