const userModel = require("../models/User");

exports.getAvailability = async (req, res) => {
  const userId = req.params.id;

  try {
    // Fetch the user by ID
    const user = await userModel.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user's availability
    return res.status(200).json({
      availability: user.availability,
      absences: userModel.absences,
      message: "User availability fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching user availability:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.createAvailability = async (req, res) => {
  const userId = req.params.id;
  const { availability, absences } = req.body;

  try {
    // Validate the request body
    // if (!availability || !Array.isArray(availability)) {
    //   return res.status(400).json({ message: "Invalid availability data" });
    // }

    // Fetch the user by ID
    const user = await userModel.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create new availability and absences
    user.availability = availability;
    user.absences = absences;

    // Save the updated user
    await user.save();

    return res.status(201).json({
      message: "User availability created successfully",
      availability: user.availability,
      absences: user.absences,
    });
  } catch (error) {
    console.error("Error creating user availability:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.markAbsence = async (req, res) => {
  const userId = req.params.id;
  const { date, reason } = req.body;

  try {
    // Validate the request body
    if (!date || !reason) {
      return res.status(400).json({ message: "Date and reason are required" });
    }

    // Fetch the user by ID
    const user = await userModel.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new absence entry
    const newAbsence = { date, reason };
    user.absences.push(newAbsence);

    // Save the updated user
    await user.save();

    return res.status(201).json({
      message: "Absence marked successfully",
      absences: user.absences,
    });
  } catch (error) {
    console.error("Error marking absence:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.clearAbsences = async (req, res) => {
  const userId = req.params.id;

  try {
    // Fetch the user by ID
    const user = await userModel.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Clear all absences
    user.absences = [];

    // Save the updated user
    await user.save();

    return res.status(200).json({
      message: "Absence cleared successfully",
      absences: user.absences,
    });
  } catch (error) {
    console.error("Error clearing absence:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
