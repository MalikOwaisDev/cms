const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const patientRoutes = require("./routes/patientRoutes");
const trainingRoutes = require("./routes/trainingRoutes");
const wellnessRoutes = require("./routes/wellnessRoutes");
const VisitRoutes = require("./routes/VisitRoutes");
const caregiverRoutes = require("./routes/caregiverRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");

dotenv.config();
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://cms-front-indol.vercel.app",
  "http://localhost:4000",
];
app.use(cookieParser()); // for parsing cookies
app.use(express.static(path.join(__dirname, "public")));
const buildPath = path.join(__dirname, "../Front-end/dist");

app.use(express.static(buildPath)); // Serve static files from the React app

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // if you're using cookies or sessions
  })
);

// app.get("/", (req, res) => {
//   res.json("Welcome to the Care Management System");
// });
app.use("/api/auth", authRoutes);
app.use("/api/carer", availabilityRoutes);
app.use("/api/Patients", patientRoutes);
app.use("/api/trainings", trainingRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/wellness", wellnessRoutes);
app.use("/api/visits", VisitRoutes);
app.use("/api/caregivers", caregiverRoutes);

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, "../Front-end/dist/index.html"));
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log(err));
