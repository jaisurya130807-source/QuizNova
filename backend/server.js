const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const leaderboardRoutes = require("./routes/LeaderboardRoutes");
const questionRoutes = require("./routes/questionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const topicRoutes = require("./routes/topicRoutes");

const app = express();

/*
====================================================
MIDDLEWARE
====================================================
*/

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/*
====================================================
ROUTES
====================================================
*/

// Authentication
app.use(
  "/api/auth",
  authRoutes
);

// Leaderboard
app.use(
  "/api/leaderboard",
  leaderboardRoutes
);

// Questions
app.use(
  "/api/questions",
  questionRoutes
);

// Public topics for students
app.use(
  "/api/topics",
  topicRoutes
);

// Admin APIs
app.use(
  "/api/admin",
  adminRoutes
);

/*
====================================================
HOME
====================================================
*/

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "QuizNova Backend is Running 🚀",
  });
});

/*
====================================================
DATABASE + SERVER
====================================================
*/

const PORT =
  process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log(
      "✅ MongoDB Connected"
    );

    app.listen(
      PORT,
      () => {
        console.log(
          `🚀 Server running on port ${PORT}`
        );

        console.log(
          `🌐 http://localhost:${PORT}`
        );

        console.log(
          `📚 Topics API: http://localhost:${PORT}/api/topics`
        );

        console.log(
          `🔐 Admin API: http://localhost:${PORT}/api/admin`
        );
      }
    );
  } catch (error) {
    console.error(
      "❌ MongoDB Connection Error:",
      error
    );

    process.exit(1);
  }
};

startServer();