const express = require("express");
const router = express.Router();
const {
  createVisit,
  getTodaysVisits,
  updateVisitStatus,
  updateTaskStatus,
  updateMedicationStatus,
  getVisits,
  getVisit,
  deleteVisit,
} = require("../controllers/VisitController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", protect, adminOnly, getVisits);
router.post("/", protect, adminOnly, createVisit);
router.get("/today", protect, getTodaysVisits);
router.patch("/:id", protect, updateVisitStatus);
router.get("/:id", protect, adminOnly, getVisit);
router.patch("/:id/tasks/:taskId", protect, updateTaskStatus);
router.patch("/:id/medications/:medicationId", protect, updateMedicationStatus);
router.delete("/:id", protect, deleteVisit);

module.exports = router;
