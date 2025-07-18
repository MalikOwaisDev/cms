const express = require("express");
const router = express.Router();
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getCareGivers,
} = require("../controllers/patientController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getPatients);
router.get("/get-carers", getCareGivers);
router.post("/new", protect, adminOnly, createPatient);
router.get("/:id", getPatientById);
router.put("/:id", protect, adminOnly, updatePatient);
router.delete("/:id", protect, adminOnly, deletePatient);

module.exports = router;
