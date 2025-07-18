const express = require("express");
const router = express.Router();
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  markAsPaid,
  updateInvoice,
  deleteInvoice,
} = require("../controllers/invoiceController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect, adminOnly);

router.post("/", createInvoice);
router.get("/", getInvoices);
router.get("/:id", getInvoiceById);
router.delete("/:id", adminOnly, deleteInvoice);
router.put("/:id", updateInvoice);
router.put("/:id/pay", markAsPaid);

module.exports = router;
