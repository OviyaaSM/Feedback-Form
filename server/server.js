const dns = require("node:dns");

// Use public DNS servers during local development
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
].filter(Boolean);

// Middleware
app.use(cors({
  origin: allowedOrigins
}));
app.use(express.json());

// Feedback schema
const feedbackSchema = new mongoose.Schema({
  q1: { type: String, required: true },
  q2: { type: String, required: true },
  q3: { type: String, required: true },
  q4: { type: String, required: true },
  q5: { type: String, default: "" }
}, { timestamps: true });

const Feedback = mongoose.model("Feedback", feedbackSchema);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    message: "Feedback Server Running"
  });
});

// Submit feedback
app.post("/api/feedback", async (req, res) => {
  try {
    const { q1, q2, q3, q4, q5 } = req.body;

    if (!q1 || !q2 || !q3 || !q4) {
      return res.status(400).json({
        message: "Please provide all required feedback fields."
      });
    }

    const feedback = new Feedback({
      q1,
      q2,
      q3,
      q4,
      q5: q5 || ""
    });

    await feedback.save();

    res.status(201).json({
      message: "Feedback submitted successfully!"
    });

  } catch (error) {
    console.error("Error saving feedback:", error);

    res.status(500).json({
      message: "Failed to save feedback."
    });
  }
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });
