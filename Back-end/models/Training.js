const mongoose = require("mongoose");

const trainingSchema = new mongoose.Schema(
  {
    tID: {
      type: String,
      required: [true, "Patient ID is required"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: [100, "Title must be at most 100 characters long"],
    },
    content: {
      type: String,
      maxlength: [1000, "Content must be at most 1000 characters long"],
    },
    quiz: [
      {
        question: {
          type: String,
          required: [true, "Quiz question is required"],
        },
        options: {
          type: [String],
          validate: {
            validator: function (arr) {
              return Array.isArray(arr) && arr.length >= 3;
            },
            message: "Each quiz must have at least three options",
          },
        },
        correctAnswer: String,
      },
    ],
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Training", trainingSchema);
