const express = require("express");

const router = express.Router();

const {
  // Students
  getUsers,
  deleteUser,

  // Administrators
  getAdmins,
  createAdmin,
  deleteAdmin,

  // Statistics
  getStats,

  // Topics
  getTopics,
  createTopic,
  updateTopic,
  deleteTopic,

  // Questions
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/adminController");


// ==================================================
// ADMIN STATISTICS
// ==================================================

router.get(
  "/stats",
  getStats
);


// ==================================================
// STUDENTS
// ==================================================

router.get(
  "/users",
  getUsers
);

router.delete(
  "/users/:id",
  deleteUser
);


// ==================================================
// ADMINISTRATORS
// ==================================================

// Get all administrators
router.get(
  "/admins",
  getAdmins
);

// Create administrator
router.post(
  "/admins",
  createAdmin
);

// Delete administrator
router.delete(
  "/admins/:id",
  deleteAdmin
);


// ==================================================
// TOPICS
// ==================================================

// Get all topics
router.get(
  "/topics",
  getTopics
);

// Create topic
router.post(
  "/topics",
  createTopic
);

// Update topic
router.put(
  "/topics/:id",
  updateTopic
);

// Delete topic
router.delete(
  "/topics/:id",
  deleteTopic
);


// ==================================================
// QUESTIONS
// ==================================================

// Get all questions
router.get(
  "/questions",
  getQuestions
);

// Create question
router.post(
  "/questions",
  createQuestion
);

// Update question
router.put(
  "/questions/:id",
  updateQuestion
);

// Delete question
router.delete(
  "/questions/:id",
  deleteQuestion
);


module.exports = router;