const Counter = require("../models/Counter");
const Patient = require("../models/Patient");
const Invoice = require("../models/Invoice");

exports.createInvoice = async (req, res) => {
  const { patient, caregiver, services } = req.body;
  const totalAmount = services.reduce((sum, item) => sum + item.amount, 0);
  const patientModel = await Patient.findById({ _id: patient });

  function generateInvId(num) {
    return `inv_${String(num).padStart(4, "0")}`;
  }
  // Get or create the counter
  const counter = await Counter.findOneAndUpdate(
    { name: "invoice" },
    { $inc: { count: 1 } },
    { new: true, upsert: true }
  );
  const invID = generateInvId(counter.count);

  const invoice = await Invoice.create({
    invID,
    patient,
    caregiver,
    services,
    totalAmount,
  });
  patientModel.invoices.push(invoice._id);
  await patientModel.save();

  res.status(201).json(invoice);
};

exports.getInvoices = async (req, res) => {
  const invoices = await Invoice.find().populate("patient", "name");
  res.json(invoices);
};

exports.getInvoiceById = async (req, res) => {
  const invoice = await Invoice.findOne({ invID: req.params.id })
    .populate("patient")
    .populate("caregiver");
  if (!invoice) return res.status(404).json({ message: "Invoice not found" });
  res.json(invoice);
};

exports.updateInvoice = async (req, res) => {
  const invoice = await Invoice.findOne({ invID: req.params.id });
  if (!invoice) return res.status(404).json({ message: "Not found" });

  // Update the invoice fields
  Object.keys(req.body).forEach((key) => {
    if (req.body[key] !== undefined) {
      invoice[key] = req.body[key];
    }
  });

  await invoice.save();
  res.json(invoice);
};

exports.markAsPaid = async (req, res) => {
  const invoice = await Invoice.findOne({ invID: req.params.id });
  if (!invoice) return res.status(404).json({ message: "Not found" });

  invoice.status = "paid";
  await invoice.save();

  res.json(invoice);
};

exports.deleteInvoice = async (req, res) => {
  const invoice = await Invoice.findOneAndDelete({ invID: req.params.id });
  if (!invoice) return res.status(404).json({ message: "Not found" });

  // Remove the invoice reference from the Patient
  const patient = await Patient.findById(invoice.Patient);
  if (patient) {
    patient.invoices = patient.invoices.filter(
      (invId) => invId.toString() !== invoice._id.toString()
    );
    await patient.save();
  }

  res.json({ message: "Invoice deleted successfully" });
};
