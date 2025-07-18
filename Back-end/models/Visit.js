const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  taskName: String,
  completed: { type: Boolean, default: false },
  notes: String,
});

const medicationSchema = new mongoose.Schema({
  medicationName: String,
  status: {
    type: String,
    enum: ["given", "refused", "missed"],
    default: "given",
  },
  notes: String,
});

const visitSchema = new mongoose.Schema(
  {
    caregiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    date: Date,
    startTime: String,
    endTime: String,
    location: String,
    checkInTime: Date,
    checkOutTime: Date,
    checkInLocation: String,
    checkOutLocation: String,
    taskList: [taskSchema],
    medicationList: [medicationSchema],
    notes: String,
    // audioNote: String, // file URL or base64
    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "missed"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visit", visitSchema);
