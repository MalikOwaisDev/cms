const Training = require("../models/Training");
const TrainingRecord = require("../models/TrainingRecord");
const Counter = require("../models/Counter");

// Admin: Create new training
exports.createTraining = async (req, res) => {
  const { title, content, deadline, quiz, assignedTo } = req.body;
  console.log("Creating training with data:", {
    title,
    content,
    deadline,
    quiz,
    assignedTo,
  });
  const counter = await Counter.findOneAndUpdate(
    { name: "training" },
    { $inc: { count: 1 } },
    { new: true, upsert: true }
  );

  const tID = `tar_${counter.count}`;

  const training = await Training.create({
    title,
    tID,
    content,
    deadline,
    quiz,
    assignedTo,
  });

  // Create records for each caregiver
  assignedTo.forEach(async (caregiverId) => {
    await TrainingRecord.create({
      training: training._id,
      caregiver: caregiverId,
    });
  });

  res.status(201).json(training);
};

// Get training list (admin sees all, caregiver sees assigned)
exports.getTrainings = async (req, res) => {
  const role = req.user.role;

  if (role === "admin") {
    const trainings = await Training.find().populate("assignedTo", "name");
    return res.json(trainings);
  }

  const records = await TrainingRecord.find({
    caregiver: req.user._id,
  }).populate("training");
  res.json(
    records.map((record) => ({
      ...record._doc,
      status: record.status,
      dateCompleted: record.dateCompleted,
      recordId: record._id,
    }))
  );
};

exports.getHistory = async (req, res) => {
  const role = req.user.role;

  if (role === "admin") {
    const records = await TrainingRecord.find()
      .populate({
        path: "training",
        populate: {
          path: "assignedTo",
          select: "-password",
        },
      })
      .populate("caregiver"); // top-level caregiver on the TrainingRecord
    return res.json(records);
  }

  // Caregiver: Get completed training history
  const records = await TrainingRecord.find({
    caregiver: req.user._id,
    status: "completed",
  }).populate({
    path: "training",
    populate: {
      path: "assignedTo",
      select: "-password",
    },
  });

  res.json(records);
};

// Caregiver: Mark training complete
exports.completeTraining = async (req, res) => {
  const record = await TrainingRecord.findOneAndUpdate(
    { training: req.params.id },
    { status: "completed", dateCompleted: new Date() },
    { new: true }
  );
  res.json(record);
};

exports.getTrainingByID = async (req, res) => {
  const training = await Training.findOne({ tID: req.params.id }).populate(
    "assignedTo",
    "name"
  );
  if (!training) {
    return res.status(404).json({ message: "Training not found" });
  }
  res.json(training);
};

exports.updateTraining = async (req, res) => {
  const { title, content, deadline, quiz, assignedTo } = req.body;

  const training = await Training.findOneAndUpdate(
    { tID: req.params.id },
    { title, content, deadline, quiz, assignedTo },
    { new: true }
  );

  if (!training) {
    return res.status(404).json({ message: "Training not found" });
  }

  // Update records for each caregiver
  await TrainingRecord.updateMany(
    { training: training._id, caregiver: { $in: assignedTo } },
    {
      /* update fields here */
    }
  );

  res.json(training);
};

exports.deleteTraining = async (req, res) => {
  console.log("Deleting training with ID:", req.params.id);
  const training = await Training.findOneAndDelete({ tID: req.params.id });

  if (!training) {
    return res.status(404).json({ message: "Training not found" });
  }

  // Delete all records associated with this training
  await TrainingRecord.deleteMany({ training: training._id });

  res.json({ message: "Training deleted successfully" });
};
