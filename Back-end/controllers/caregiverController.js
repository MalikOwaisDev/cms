const user = require("../models/User");

exports.createCaregiver = async (req, res) => {
  try {
    const { name, email, password, phone, avatar } = req.body;

    // Check if caregiver already exists
    const existingCaregiver = await user.findOne({ email });
    if (existingCaregiver)
      return res.status(400).json({ message: "Caregiver already exists" });

    // Create new caregiver
    const newCaregiver = new user({
      name,
      email,
      password,
      phone,
      avatar,
      role: "caregiver",
    });

    await newCaregiver.save();
    res.status(201).json(newCaregiver);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCaregivers = async (req, res) => {
  try {
    const caregivers = await user
      .find({ role: "caregiver" })
      .select("-password");
    res.status(200).json(caregivers);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.availableCaregivers = async (req, res) => {
  const { date } = req.body;
  const dayStart = new Date(date); // "2025-07-09T00:00:00.000Z"
  const dayEnd = new Date(date);
  dayEnd.setUTCHours(23, 59, 59, 999); // "2025-07-09T23:59:59.999Z"

  try {
    const caregivers = await user
      .find({
        role: "caregiver",
        availability: {
          $elemMatch: {
            date: {
              $gte: dayStart,
              $lte: dayEnd,
            },
          },
        },
      })
      .select("-password");

    res.status(200).json(caregivers);
  } catch (err) {
    console.error("Error fetching caregivers:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCaregiverById = async (req, res) => {
  try {
    const caregiver = await user.findById(req.params.id).select("-password");
    if (!caregiver)
      return res.status(404).json({ message: "Caregiver not found" });
    res.status(200).json(caregiver);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCaregiver = async (req, res) => {
  try {
    const caregiver = await user
      .findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      })
      .select("-password");
    console.log("Updating caregiver:", caregiver);

    if (req.body.password !== undefined && req.body.password !== null) {
      caregiver.password = req.body.password;
    }
    await caregiver.save();

    console.log(caregiver.password);

    if (!caregiver)
      return res.status(404).json({ message: "Caregiver not found" });

    res.status(200).json(caregiver);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCaregiver = async (req, res) => {
  try {
    const caregiver = await user.findByIdAndDelete(req.params.id);
    if (!caregiver)
      return res.status(404).json({ message: "Caregiver not found" });
    res.status(200).json({ message: "Caregiver deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
