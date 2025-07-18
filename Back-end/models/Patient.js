const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    maxlength: [100, "Street is too long (max 100 chars)"],
    required: [true, "Street address is required"],
  },
  city: {
    type: String,
    maxlength: [50, "City name is too long (max 50 chars)"],
    required: [true, "City is required"],
  },
  state: {
    type: String,
    maxlength: [50, "State name is too long (max 50 chars)"],
  },
  postalCode: {
    type: String,
    maxlength: [20, "Postal code is too long (max 20 chars)"],
  },
  country: {
    type: String,
    maxlength: [50, "Country name is too long (max 50 chars)"],
    required: [true, "Country is required"],
  },
});

const patientSchema = new mongoose.Schema(
  {
    pID: {
      type: String,
      required: [true, "Patient ID is required"],
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Patient name is required"],
    },
    age: {
      type: Number,
      min: [0, "Age must be a positive number"],
      max: [120, "Age seems unrealistic"],
      validate: {
        validator: Number.isInteger,
        message: "Age must be an integer",
      },
      required: [true, "Age is required"],
    },
    gender: {
      type: String,
      enum: {
        values: ["Male", "Female", "Other"],
        message: "Gender must be Male, Female, or Other",
      },
      required: [true, "Gender is required"],
    },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          return /^(\+\d{1,3}[- ]?)?\d{10,15}$/.test(v);
        },
        message: "Phone must be a valid phone number (10-15 digits)",
      },
      required: [true, "Phone number is required"],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: "Email must be a valid email address",
      },
      required: [true, "Email address is required"],
      unique: true,
    },
    diagnosis: {
      type: String,
      maxlength: [200, "Diagnosis is too long (max 200 chars)"],
    },
    address: addressSchema,
    lastVisit: { type: Date, default: Date.now },
    notes: {
      type: String,
      maxlength: [500, "Notes are too long (max 500 chars)"],
    },
    assignedCaregiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    invoices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Invoice",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
