const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  createCaregiver,
  getCaregivers,
  getCaregiverById,
  updateCaregiver,
  deleteCaregiver,
  availableCaregivers,
} = require("../controllers/caregiverController");

router.post("/", protect, adminOnly, createCaregiver);
router.get("/", protect, adminOnly, getCaregivers);
router.post("/available", protect, adminOnly, availableCaregivers);
router.get("/:id", protect, adminOnly, getCaregiverById);
router.put("/:id", protect, adminOnly, updateCaregiver);
router.delete("/:id", protect, adminOnly, deleteCaregiver);

module.exports = router;
