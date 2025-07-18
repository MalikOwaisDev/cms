const express = require("express");
const router = express.Router();
const {
  createTraining,
  getTrainings,
  completeTraining,
  getTrainingByID,
  updateTraining,
  deleteTraining,
  getHistory,
} = require("../controllers/trainingController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getTrainings);
router.get("/history", getHistory);
router.post("/", adminOnly, createTraining);
router.get("/:id", getTrainingByID);
router.put("/:id", adminOnly, updateTraining);
router.delete("/:id", adminOnly, deleteTraining);
router.put("/complete/:id", completeTraining);

module.exports = router;
