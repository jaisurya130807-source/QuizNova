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

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

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

app.use("/api/auth", authRoutes);

app.use("/api/leaderboard", leaderboardRoutes);

app.use("/api/questions", questionRoutes);

app.use("/api/topics", topicRoutes);

app.use("/api/admin", adminRoutes);

/*
====================================================
HOME / HEALTH CHECK
====================================================
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "QuizNova Backend is Running 🚀",
  });
});

/*
====================================================
DATABASE + SERVER
====================================================
*/

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    /*
    -----------------------------------------------
    CHECK ENVIRONMENT VARIABLES
    -----------------------------------------------
    */

    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI is missing from .env");
      process.exit(1);
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing from .env");
      process.exit(1);
    }

    console.log("🔄 Connecting to MongoDB Atlas...");

    /*
    -----------------------------------------------
    MONGODB CONNECTION
    -----------------------------------------------
    */

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log("✅ MongoDB Atlas Connected Successfully");

    /*
    -----------------------------------------------
    START EXPRESS SERVER
    -----------------------------------------------
    */

    app.listen(PORT, () => {
      console.log("");
      console.log("========================================");
      console.log("       QUIZNOVA BACKEND STARTED");
      console.log("========================================");
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 http://localhost:${PORT}`);
      console.log(`📚 Topics API: http://localhost:${PORT}/api/topics`);
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
      console.log(`🏆 Leaderboard API: http://localhost:${PORT}/api/leaderboard`);
      console.log(`❓ Questions API: http://localhost:${PORT}/api/questions`);
      console.log(`👨‍💼 Admin API: http://localhost:${PORT}/api/admin`);
      console.log("========================================");
      console.log("");
    });
  } catch (error) {
    console.error("");
    console.error("❌ MongoDB Connection Error");
    console.error("========================================");

    /*
    -----------------------------------------------
    ATLAS AUTHENTICATION ERROR
    -----------------------------------------------
    */

    if (error?.code === 8000 || error?.codeName === "AtlasError") {
      console.error(
        "❌ Atlas authentication failed."
      );
      console.error(
        "👉 Check the quiznova database username and password."
      );
      console.error(
        "👉 Also check the MONGODB_URI inside backend/.env"
      );
    }

    /*
    -----------------------------------------------
    NETWORK ERROR
    -----------------------------------------------
    */

    else if (
      error?.code === "ECONNREFUSED" ||
      error?.code === "ENOTFOUND"
    ) {
      console.error(
        "❌ Could not reach MongoDB Atlas."
      );
      console.error(
        "👉 Check your internet connection and Atlas connection string."
      );
    }

    /*
    -----------------------------------------------
    OTHER ERRORS
    -----------------------------------------------
    */

    else {
      console.error("Error:", error?.message || error);
    }

    console.error("========================================");
    console.error("");

    process.exit(1);
  }
};

/*
====================================================
START APPLICATION
====================================================
*/

startServer();