const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Routes
const authRoutes = require("./routes/authRoutes");
const leaderboardRoutes = require("./routes/LeaderboardRoutes");
const questionRoutes = require("./routes/questionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const topicRoutes = require("./routes/topicRoutes");

const app = express();

/* =========================================================
   CORS CONFIGURATION
   ========================================================= */

const allowedOrigins = [
  "https://quiznova-five.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without an Origin header
    // (Postman, curl, server-to-server requests, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  optionsSuccessStatus: 204,
};

// CORS middleware
app.use(cors(corsOptions));

// Explicitly handle browser preflight requests
app.options(/.*/, cors(corsOptions));


/* =========================================================
   BODY PARSING
   ========================================================= */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);


/* =========================================================
   API ROUTES
   ========================================================= */

app.use("/api/auth", authRoutes);

app.use("/api/leaderboard", leaderboardRoutes);

app.use("/api/questions", questionRoutes);

app.use("/api/topics", topicRoutes);

app.use("/api/admin", adminRoutes);


/* =========================================================
   ROOT ROUTE
   ========================================================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "QuizNova Backend is Running 🚀",
  });
});


/* =========================================================
   HEALTH CHECK
   ========================================================= */

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "QuizNova API is healthy",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});


/* =========================================================
   404 HANDLER
   ========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});


/* =========================================================
   ERROR HANDLER
   ========================================================= */

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy blocked this request",
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});


/* =========================================================
   SERVER START
   ========================================================= */

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Check MongoDB URI
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI is missing in environment variables");
      process.exit(1);
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing in environment variables");
      process.exit(1);
    }

    console.log("🔄 Connecting to MongoDB Atlas...");

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log("✅ MongoDB Atlas Connected Successfully");

    app.listen(PORT, () => {
      console.log("");
      console.log("======================================");
      console.log("      QUIZNOVA BACKEND STARTED 🚀");
      console.log("======================================");
      console.log(`Server running on port ${PORT}`);
      console.log(`http://localhost:${PORT}`);
      console.log("");
      console.log("API Routes:");
      console.log(`Auth:        /api/auth`);
      console.log(`Topics:      /api/topics`);
      console.log(`Questions:   /api/questions`);
      console.log(`Leaderboard: /api/leaderboard`);
      console.log(`Admin:       /api/admin`);
      console.log("");
      console.log("Health Check:");
      console.log(`/health`);
      console.log("======================================");
    });
  } catch (error) {
    console.error("");
    console.error("❌ Failed to start QuizNova backend");
    console.error("Error:", error.message);
    console.error("");

    process.exit(1);
  }
};

startServer();