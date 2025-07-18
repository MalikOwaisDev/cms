const Visit = require("../models/Visit");

exports.getVisits = async (req, res) => {
  try {
    const visits = await Visit.find()
      .populate("patient")
      .populate("caregiver")
      .sort({ date: -1 });
    res.status(200).json({ success: true, visits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getVisit = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id)
      .populate("patient")
      .populate("caregiver");
    if (!visit) {
      return res
        .status(404)
        .json({ success: false, message: "Visit not found" });
    }
    res.status(200).json({ success: true, visit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createVisit = async (req, res) => {
  try {
    const visit = await Visit.create(req.body);
    res.status(201).json({ success: true, visit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTodaysVisits = async (req, res) => {
  try {
    const caregiverId = req.user.id;
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    const visits = await Visit.find({
      caregiver: caregiverId,
      date: { $gte: start, $lte: end },
    }).populate("patient");

    res.status(200).json({ success: true, visits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateVisitStatus = async (req, res) => {
  try {
    const visit = await Visit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({ success: true, visit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const updateFields = {};
    if (req.body.notes !== undefined) {
      updateFields["taskList.$.notes"] = req.body.notes;
    }
    if (req.body.completed !== undefined) {
      updateFields["taskList.$.completed"] = req.body.completed;
    }

    const visit = await Visit.findOneAndUpdate(
      { _id: req.params.id, "taskList._id": req.params.taskId },
      { $set: updateFields },
      { new: true }
    );
    res.status(200).json({ success: true, visit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateMedicationStatus = async (req, res) => {
  try {
    const updateFields = {};
    if (req.body.notes !== undefined) {
      updateFields["medicationList.$.notes"] = req.body.notes;
    }
    if (req.body.status !== undefined) {
      updateFields["medicationList.$.status"] = req.body.status;
    }
    const visit = await Visit.findOneAndUpdate(
      { _id: req.params.id, "medicationList._id": req.params.medicationId },
      { $set: updateFields },
      { new: true }
    );
    res.status(200).json({ success: true, visit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteVisit = async (req, res) => {
  try {
    const visit = await Visit.findByIdAndDelete(req.params.id);
    if (!visit) {
      return res
        .status(404)
        .json({ success: false, message: "Visit not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Visit deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
