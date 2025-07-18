const Patient = require("../models/Patient");
const userModel = require("../models/User");
const Counter = require("../models/Counter");
const { assign } = require("nodemailer/lib/shared");

// GET all Patients (admin sees all, caregiver sees assigned only)
exports.getPatients = async (req, res) => {
  const role = req.user.role;
  const query = role === "caregiver" ? { assignedCaregiver: req.user._id } : {};
  const Patients = await Patient.find(query);
  res.status(200).json(Patients);
};

// GET single Patient
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findOne({ pID: id }).populate(
      "assignedCaregiver invoices",
      " -__v -createdAt -updatedAt"
    );
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    patient.lastVisit = Date.now();
    await patient.save(); // Update last visit timestamp
    res.status(200).json(patient);
  } catch (error) {
    console.error("Error fetching Patient:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE Patient (admin only)
exports.createPatient = async (req, res) => {
  try {
    const existingPatient = await Patient.findOne({ email: req.body.email });
    if (existingPatient) {
      return res
        .status(400)
        .json({ message: "Patient already exists, Patient's Email Found" });
    }

    // Get or create the counter
    const counter = await Counter.findOneAndUpdate(
      { name: "patient" },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );

    const pID = `pat_${counter.count}`;

    const newPatient = await Patient.create({
      ...req.body,
      pID,
      assignedCaregiver: req.body.caregiver || null,
    });

    if (!newPatient) return res.status(400).json({ message: "Invalid data" });

    res.status(201).json(newPatient);
  } catch (error) {
    console.error("Error creating Patient:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

// UPDATE Patient (admin only)
exports.updatePatient = async (req, res) => {
  const updated = await Patient.findOneAndUpdate(
    { pID: req.params.id },
    {
      ...req.body,
      assignedCaregiver: req.body.assignedCaregiver || null, // Ensure caregiver is updated if provided
      invoices: req.body.invoices || [], // Ensure invoices are updated if provided
    },
    {
      new: true,
    }
  );
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.status(200).json(updated);
};

// DELETE Patient (admin only)
exports.deletePatient = async (req, res) => {
  const deleted = await Patient.findOneAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Not found" });
  res.status(200).json({ message: "Patient removed" });
};

exports.getCareGivers = async (req, res) => {
  try {
    const caregivers = await userModel
      .find({ role: "caregiver" })
      .select("-password");
    if (!caregivers || caregivers.length === 0) {
      return res.status(404).json({ message: "No caregivers found" });
    }
    res.status(200).json(caregivers);
  } catch (error) {
    console.error("Error fetching caregivers:", error);
    res.status(500).json({ message: "Server error" });
  }
};
