const express = require("express");

const router = express.Router();

const {
  saveLeaderboard,
  getLeaderboard,
  getLeaderboardById,
  deleteLeaderboard,
} = require("../controllers/LeaderboardController");

const {
  protectAdmin,
} = require("../middleware/adminMiddleware");

/*
=====================================================
SAVE QUIZ RESULT
=====================================================

POST /api/leaderboard

Used when a student finishes a quiz.
The controller identifies the logged-in student
from the JWT token.

=====================================================
*/

router.post(
  "/",
  saveLeaderboard
);


/*
=====================================================
STUDENT / GENERAL RESULT VIEW
=====================================================

GET /api/leaderboard

IMPORTANT:
The controller should return only the authenticated
student's own results for normal users.

=====================================================
*/

router.get(
  "/",
  getLeaderboard
);


/*
=====================================================
GET ONE RESULT
=====================================================

GET /api/leaderboard/:id

Used to retrieve a single quiz result.

=====================================================
*/

router.get(
  "/:id",
  getLeaderboardById
);


/*
=====================================================
DELETE RESULT
=====================================================

ADMIN ONLY

DELETE /api/leaderboard/:id

Students cannot delete quiz results.

=====================================================
*/

router.delete(
  "/:id",
  protectAdmin,
  deleteLeaderboard
);


module.exports = router;