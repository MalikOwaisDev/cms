const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getAvailability,
  createAvailability,
  markAbsence,
  clearAbsences,
} = require("../controllers/availabilityController");

router.get("/:id/availability", protect, getAvailability);
router.patch("/:id/availability", protect, createAvailability);
router.post("/:id/absences", protect, markAbsence);
router.delete("/:id/absences", protect, adminOnly, clearAbsences);

module.exports = router;
