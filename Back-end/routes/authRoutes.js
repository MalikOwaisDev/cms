const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  update,
  sendOtp,
  verifyOtp,
  reset,
  sendPassOtp,
  logout,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const upload = require("../config/multerSetup");

router.post(
  "/register",
  // body("name").notEmpty().withMessage("Name is required"),
  // body("email").isEmail().withMessage("Invalid email format"),
  // body("password")
  //   .isString()
  //   .isLength({ min: 8 })
  //   .withMessage("Password must be at least 8 characters long"),
  // body("role")
  //   .optional()
  //   .isIn(["admin", "caregiver"])
  //   .withMessage("Role must be either 'admin' or 'caregiver'"),
  upload.single("avatar"),
  register
);
router.post(
  "/login",
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  login
);
router.get("/me", protect, getMe);
router.post("/update", protect, upload.single("avatar"), update);
router.post("/reset", reset);

router.post("/send-otp", sendOtp);
router.post("/send-pass-otp", sendPassOtp);
router.post("/verify-otp", verifyOtp);

router.get("/logout", logout);

module.exports = router;
