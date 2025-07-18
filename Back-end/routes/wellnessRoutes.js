const express = require("express");
const router = express.Router();
const {
  createCarePlan,
  getCarePlans,
  updateGoalStatus,
  createResource,
  getResources,
  getCarePlan,
  updateCarePlan,
  deleteResource,
  deleteCarePlan,
} = require("../controllers/wellnessController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect);

// Care Plans
router.post("/care-plan", createCarePlan);
router.get("/care-plan", getCarePlans);
router.put("/care-plan/goal", updateGoalStatus);
router.get("/care-plan/:id", getCarePlan);
router.put("/care-plan/:id", updateCarePlan);
router.delete("/care-plan/:id", adminOnly, deleteCarePlan);

// Resources
router.post("/resources", adminOnly, createResource);
router.get("/resources", getResources);
router.delete("/resources/:id", adminOnly, deleteResource);

module.exports = router;
