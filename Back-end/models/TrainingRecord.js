const mongoose = require("mongoose");

const trainingRecordSchema = new mongoose.Schema(
  {
    training: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Training",
    },
    caregiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "completed"],
        message: "Status must be pending or completed",
      },
      default: "pending",
    },
    dateCompleted: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrainingRecord", trainingRecordSchema);
