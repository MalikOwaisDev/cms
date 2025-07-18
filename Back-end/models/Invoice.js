const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invID: {
      type: String,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    caregiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    services: [
      {
        description: {
          type: String,
          maxlength: [
            200,
            "Service description must be at most 200 characters long",
          ],
        },
        amount: {
          type: Number,
          required: [true, "Service amount is required"],
          min: [0, "Service amount must be positive"],
        },
      },
    ],
    totalAmount: {
      type: Number,
      min: [0, "Total amount must be positive"],
    },
    status: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    issuedDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
      default: function () {
        const date = new Date();
        date.setDate(date.getDate() + 10);
        return date;
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
