const CarePlan = require("../models/CarePlan");
const Counter = require("../models/Counter");
const WellnessResource = require("../models/WellnessResource");

exports.createCarePlan = async (req, res) => {
  const { patient, title, description, goals } = req.body;
  const counter = await Counter.findOneAndUpdate(
    { name: "carePlans" },
    { $inc: { count: 1 } },
    { new: true, upsert: true }
  );

  const careID = `care_${counter.count}`;
  const plan = await CarePlan.create({
    patient,
    title,
    careID,
    description,
    goals,
    createdBy: req.user._id,
  });
  res.status(201).json(plan);
};

exports.getCarePlans = async (req, res) => {
  const id = req.user._id;
  if (req.user.role !== "admin") {
    const plans = await CarePlan.find({ createdBy: id }).populate(
      "patient",
      "name"
    );
    return res.json(plans);
  }
  const plans = await CarePlan.find().populate("patient", "name");
  res.json(plans);
};

exports.getCarePlan = async (req, res) => {
  const plan = await CarePlan.findOne({ careID: req.params.id }).populate(
    "patient",
    "name"
  );
  if (!plan) return res.status(404).json({ message: "Not found" });
  res.json(plan);
};

exports.updateCarePlan = async (req, res) => {
  const careID = req.params.id;
  const { title, description, goals } = req.body;
  const plan = await CarePlan.findOne({ careID });
  if (!plan) return res.status(404).json({ message: "Not found" });

  plan.title = title;
  plan.description = description;
  plan.goals = goals;
  await plan.save();

  res.json(plan);
};

exports.deleteCarePlan = async (req, res) => {
  const plan = await CarePlan.findOneAndDelete({ careID: req.params.id });
  if (!plan) return res.status(404).json({ message: "Not found" });

  res.json({ message: "Care plan deleted successfully" });
};

exports.updateGoalStatus = async (req, res) => {
  const { planId, goalIndex, status } = req.body;
  console.log(planId, goalIndex, status);
  const plan = await CarePlan.findById(planId);
  if (!plan) return res.status(404).json({ message: "Not found" });

  plan.goals[goalIndex].status = status;
  await plan.save();

  res.json(plan);
};

exports.createResource = async (req, res) => {
  const { title, description, link, category } = req.body;
  const resource = await WellnessResource.create({
    title,
    description,
    link,
    category,
  });
  res.status(201).json(resource);
};

exports.getResources = async (req, res) => {
  const resources = await WellnessResource.find();
  res.json(resources);
};

exports.deleteResource = async (req, res) => {
  const resource = await WellnessResource.findByIdAndDelete(req.params.id);
  if (!resource) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Resource deleted successfully" });
};
