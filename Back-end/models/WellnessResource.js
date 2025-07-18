const mongoose = require("mongoose");

const wellnessResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: [100, "Title must be at most 100 characters long"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [500, "Description must be at most 500 characters long"],
    },
    link: {
      type: String,
      required: [true, "Resource link is required"],
      validate: {
        validator: function (v) {
          return /^(https?:\/\/)?([\w\-])+\.[\w\-]+(\/[\w\- .\/\?%&=]*)?$/.test(
            v
          );
        },
        message: "Link must be a valid URL",
      },
    },
    category: {
      type: String,
      enum: {
        values: ["diet", "exercise", "mental", "other"],
        message: "Category must be diet, exercise, mental, or other",
      },
      required: [true, "Category is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WellnessResource", wellnessResourceSchema);
