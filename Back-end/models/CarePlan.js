const mongoose = require("mongoose");

const carePlanSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    careID: {
      type: String,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: [100, "Title must be at most 100 characters long"],
    },
    description: {
      type: String,
      maxlength: [500, "Description must be at most 500 characters long"],
    },
    goals: [
      {
        goal: {
          type: String,
          required: [true, "Goal description is required"],
        },
        status: {
          type: String,
          enum: {
            values: ["pending", "in progress", "achieved"],
            message: "Status must be pending, in progress, or achieved",
          },
          default: "pending",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CarePlan", carePlanSchema);
