const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Leaderboard = require("../models/Leaderboard");
const User = require("../models/User");


// =====================================================
// GET AUTHENTICATED USER
// =====================================================

const getAuthenticatedUser = async (req) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (
      !decoded?.id ||
      !mongoose.Types.ObjectId.isValid(decoded.id)
    ) {
      return null;
    }

    const user = await User.findById(decoded.id)
      .select("name email role")
      .lean();

    return user || null;

  } catch (error) {
    console.error(
      "Could not identify authenticated user:",
      error.message
    );

    return null;
  }
};


// =====================================================
// GET STUDENT ID FROM TOKEN
// =====================================================

const getAuthenticatedUserId = async (req) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (
      !decoded?.id ||
      !mongoose.Types.ObjectId.isValid(decoded.id)
    ) {
      return null;
    }

    return decoded.id;

  } catch (error) {
    return null;
  }
};


// =====================================================
// SAVE LEADERBOARD RESULT
// POST /api/leaderboard
// =====================================================

const saveLeaderboard = async (req, res) => {
  try {

    console.log("\n======================================");
    console.log("📥 POST /api/leaderboard");
    console.log("Request body:", req.body);


    // -------------------------------------------------
    // REQUEST DATA
    // -------------------------------------------------

    const {
      username,
      studentName,
      email,
      studentEmail,
      category,
      score,
      totalQuestions,
      percentage,
    } = req.body;


    // -------------------------------------------------
    // GET LOGGED-IN USER
    // -------------------------------------------------

    const loggedInUser =
      await getAuthenticatedUser(req);


    // -------------------------------------------------
    // NAME
    // -------------------------------------------------

    const finalName =
      String(
        loggedInUser?.name ||
        studentName ||
        username ||
        "Student"
      ).trim();


    // -------------------------------------------------
    // EMAIL
    // -------------------------------------------------

    const finalEmail =
      String(
        loggedInUser?.email ||
        studentEmail ||
        email ||
        ""
      )
        .trim()
        .toLowerCase();


    // -------------------------------------------------
    // CATEGORY / TOPIC
    // -------------------------------------------------

    if (
      !category ||
      String(category).trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }


    const finalCategory =
      String(category).trim();


    // -------------------------------------------------
    // SCORE
    // -------------------------------------------------

    const numericScore =
      Number(score);

    const numericTotal =
      Number(totalQuestions);


    if (
      !Number.isFinite(numericScore) ||
      !Number.isFinite(numericTotal)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Score and totalQuestions must be numbers",
      });
    }


    if (numericScore < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Score cannot be negative",
      });
    }


    if (numericTotal < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Total questions cannot be negative",
      });
    }


    if (numericScore > numericTotal) {
      return res.status(400).json({
        success: false,
        message:
          "Score cannot be greater than total questions",
      });
    }


    // -------------------------------------------------
    // PERCENTAGE
    // -------------------------------------------------

    let finalPercentage =
      Number(percentage);


    if (!Number.isFinite(finalPercentage)) {

      if (numericTotal > 0) {

        finalPercentage =
          (numericScore / numericTotal) * 100;

      } else {

        finalPercentage = 0;

      }
    }


    finalPercentage =
      Math.max(
        0,
        Math.min(
          100,
          finalPercentage
        )
      );


    // -------------------------------------------------
    // CREATE RESULT
    // -------------------------------------------------

    const leaderboard =
      new Leaderboard({

        userId:
          loggedInUser?._id || null,

        username:
          finalName,

        studentName:
          finalName,

        email:
          finalEmail,

        studentEmail:
          finalEmail,

        category:
          finalCategory,

        score:
          numericScore,

        totalQuestions:
          numericTotal,

        percentage:
          Number(
            finalPercentage.toFixed(2)
          ),

      });


    // -------------------------------------------------
    // SAVE RESULT
    // -------------------------------------------------

    const savedResult =
      await leaderboard.save();


    const totalDocuments =
      await Leaderboard.countDocuments();


    console.log("✅ RESULT SAVED");

    console.log("Student:", finalName);

    console.log("Email:", finalEmail);

    console.log(
      "User ID:",
      loggedInUser?._id || "Not authenticated"
    );

    console.log(
      "Topic:",
      savedResult.category
    );

    console.log(
      "Score:",
      `${savedResult.score}/${savedResult.totalQuestions}`
    );

    console.log(
      "Percentage:",
      savedResult.percentage
    );

    console.log(
      "MongoDB Result ID:",
      savedResult._id
    );

    console.log(
      "Total leaderboard documents:",
      totalDocuments
    );

    console.log("======================================\n");


    return res.status(201).json({

      success: true,

      message:
        "Leaderboard result saved successfully",

      data:
        savedResult,

      totalDocuments,

    });

  } catch (error) {

    console.error(
      "\n❌ SAVE LEADERBOARD ERROR:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Failed to save leaderboard result",

    });

  }
};


// =====================================================
// GET ALL / OWN RESULTS
//
// ADMIN:
//     Gets ONLY HIGHEST SCORE for each
//     STUDENT + TOPIC
//
// STUDENT:
//     Gets ONLY HIGHEST SCORE for each
//     of their TOPICS
//
// IMPORTANT:
// All attempts remain stored in MongoDB.
// Only the returned/displayed results are filtered.
// =====================================================

const getLeaderboard = async (req, res) => {

  try {

    console.log("\n======================================");
    console.log("📤 GET /api/leaderboard");


    // -------------------------------------------------
    // AUTHENTICATED USER
    // -------------------------------------------------

    const loggedInUser =
      await getAuthenticatedUser(req);


    // -------------------------------------------------
    // BUILD QUERY
    // -------------------------------------------------

    let query = {};


    // =================================================
    // ADMIN
    // =================================================

    if (
      loggedInUser &&
      String(loggedInUser.role).toLowerCase() === "admin"
    ) {

      console.log(
        "👑 Admin request - loading all attempts"
      );

      query = {};

    }


    // =================================================
    // STUDENT
    // =================================================

    else if (
      loggedInUser &&
      String(loggedInUser.role).toLowerCase() === "student"
    ) {

      console.log(
        "👨‍🎓 Student request - loading own attempts"
      );


      const userId =
        loggedInUser._id;


      const email =
        String(
          loggedInUser.email || ""
        )
          .trim()
          .toLowerCase();


      const conditions = [];


      // ------------------------------------------------
      // USER ID
      // ------------------------------------------------

      if (userId) {

        conditions.push({
          userId: userId,
        });

      }


      // ------------------------------------------------
      // EMAIL
      // ------------------------------------------------

      if (email) {

        conditions.push({

          $or: [

            {
              email: email,
            },

            {
              studentEmail: email,
            },

          ],

        });

      }


      if (conditions.length === 0) {

        return res.status(200).json({

          success: true,

          count: 0,

          stats: {

            totalAttempts: 0,

            totalStudents: 0,

            averageScore: 0,

            highestScore: 0,

          },

          data: [],

        });

      }


      query = {
        $or: conditions,
      };

    }


    // =================================================
    // NOT AUTHENTICATED
    // =================================================

    else {

      return res.status(401).json({

        success: false,

        message:
          "Authentication required to view leaderboard results",

      });

    }


    // -------------------------------------------------
    // LOAD ALL MATCHING ATTEMPTS
    // -------------------------------------------------

    const allResults =
      await Leaderboard.find(query)
        .sort({
          createdAt: -1,
        })
        .lean();


    console.log(
      "Total attempts found:",
      allResults.length
    );


    // =================================================
    // REMOVE DUPLICATE ATTEMPTS
    //
    // KEEP ONLY:
    //
    // STUDENT + TOPIC = HIGHEST SCORE
    //
    // Example:
    //
    // Jai + Python = 5/10
    // Jai + Python = 8/10
    // Jai + Python = 6/10
    //
    // Returned:
    //
    // Jai + Python = 8/10
    // =================================================

    const highestResultsMap =
      new Map();


    allResults.forEach((result) => {

      // ------------------------------------------------
      // IDENTIFY STUDENT
      // ------------------------------------------------

      let studentKey = "";


      if (result?.userId) {

        studentKey =
          `user:${String(result.userId)}`;

      }

      else {

        const resultEmail =
          String(
            result?.email ||
            result?.studentEmail ||
            ""
          )
            .trim()
            .toLowerCase();


        if (resultEmail) {

          studentKey =
            `email:${resultEmail}`;

        }

        else {

          const resultName =
            String(
              result?.username ||
              result?.studentName ||
              "student"
            )
              .trim()
              .toLowerCase();


          studentKey =
            `name:${resultName}`;

        }

      }


      // ------------------------------------------------
      // IDENTIFY TOPIC
      // ------------------------------------------------

      const topicKey =
        String(
          result?.category ||
          result?.topic ||
          result?.subject ||
          "quiz"
        )
          .trim()
          .toLowerCase();


      // ------------------------------------------------
      // UNIQUE KEY
      // ------------------------------------------------

      const uniqueKey =
        `${studentKey}::topic:${topicKey}`;


      // ------------------------------------------------
      // CURRENT SCORE
      // ------------------------------------------------

      const currentScore =
        Number(
          result?.score
        ) || 0;


      const currentTotal =
        Number(
          result?.totalQuestions
        ) || 0;


      // ------------------------------------------------
      // CURRENT PERCENTAGE
      // ------------------------------------------------

      let currentPercentage =
        Number(
          result?.percentage
        );


      if (!Number.isFinite(currentPercentage)) {

        currentPercentage =
          currentTotal > 0
            ? (
                currentScore /
                currentTotal
              ) * 100
            : 0;

      }


      // ------------------------------------------------
      // EXISTING BEST RESULT
      // ------------------------------------------------

      const existing =
        highestResultsMap.get(
          uniqueKey
        );


      // ------------------------------------------------
      // IF NO EXISTING RESULT
      // ------------------------------------------------

      if (!existing) {

        highestResultsMap.set(
          uniqueKey,
          result
        );

        return;

      }


      // ------------------------------------------------
      // EXISTING SCORE
      // ------------------------------------------------

      const existingScore =
        Number(
          existing?.score
        ) || 0;


      const existingTotal =
        Number(
          existing?.totalQuestions
        ) || 0;


      let existingPercentage =
        Number(
          existing?.percentage
        );


      if (!Number.isFinite(existingPercentage)) {

        existingPercentage =
          existingTotal > 0
            ? (
                existingScore /
                existingTotal
              ) * 100
            : 0;

      }


      // =================================================
      // COMPARE RESULTS
      // =================================================

      let shouldReplace = false;


      // ------------------------------------------------
      // 1. HIGHEST RAW SCORE
      // ------------------------------------------------

      if (
        currentScore >
        existingScore
      ) {

        shouldReplace = true;

      }


      // ------------------------------------------------
      // 2. IF SAME SCORE
      //    USE HIGHEST PERCENTAGE
      // ------------------------------------------------

      else if (
        currentScore ===
        existingScore &&
        currentPercentage >
        existingPercentage
      ) {

        shouldReplace = true;

      }


      // ------------------------------------------------
      // 3. IF EVERYTHING SAME
      //    KEEP LATEST ATTEMPT
      // ------------------------------------------------

      else if (
        currentScore ===
        existingScore &&
        currentPercentage ===
        existingPercentage
      ) {

        const currentDate =
          new Date(
            result?.createdAt || 0
          ).getTime();


        const existingDate =
          new Date(
            existing?.createdAt || 0
          ).getTime();


        if (
          currentDate >
          existingDate
        ) {

          shouldReplace = true;

        }

      }


      // ------------------------------------------------
      // SAVE NEW BEST
      // ------------------------------------------------

      if (shouldReplace) {

        highestResultsMap.set(
          uniqueKey,
          result
        );

      }

    });


    // -------------------------------------------------
    // FINAL RESULTS
    // -------------------------------------------------

    const leaderboard =
      Array.from(
        highestResultsMap.values()
      );


    // -------------------------------------------------
    // SORT
    // -------------------------------------------------

    leaderboard.sort(
      (a, b) => {

        const aPercentage =
          getResultPercentage(a);

        const bPercentage =
          getResultPercentage(b);


        if (
          bPercentage !==
          aPercentage
        ) {

          return (
            bPercentage -
            aPercentage
          );

        }


        return (
          new Date(
            b?.createdAt || 0
          ).getTime() -
          new Date(
            a?.createdAt || 0
          ).getTime()
        );

      }
    );


    // =================================================
    // STATISTICS
    // =================================================

    const totalAttempts =
      leaderboard.length;


    // -------------------------------------------------
    // UNIQUE STUDENTS
    // -------------------------------------------------

    const students =
      new Set();


    leaderboard.forEach(
      (result) => {

        let studentKey = "";


        if (result?.userId) {

          studentKey =
            `user:${String(result.userId)}`;

        }

        else {

          studentKey =
            String(
              result?.email ||
              result?.studentEmail ||
              result?.username ||
              result?.studentName ||
              ""
            )
              .trim()
              .toLowerCase();

        }


        if (studentKey) {

          students.add(
            studentKey
          );

        }

      }
    );


    const totalStudents =
      students.size;


    // -------------------------------------------------
    // PERCENTAGES
    // -------------------------------------------------

    const percentages =
      leaderboard.map(
        (result) =>
          getResultPercentage(result)
      );


    // -------------------------------------------------
    // AVERAGE
    // -------------------------------------------------

    const averageScore =
      percentages.length > 0

        ? percentages.reduce(
            (sum, value) =>
              sum + value,
            0
          ) /
          percentages.length

        : 0;


    // -------------------------------------------------
    // HIGHEST
    // -------------------------------------------------

    const highestScore =
      percentages.length > 0

        ? Math.max(
            ...percentages
          )

        : 0;


    // -------------------------------------------------
    // RESPONSE STATS
    // -------------------------------------------------

    const responseStats = {

      totalAttempts,

      totalStudents,

      averageScore:
        Number(
          averageScore.toFixed(2)
        ),

      highestScore:
        Number(
          highestScore.toFixed(2)
        ),

    };


    console.log(
      "Original attempts:",
      allResults.length
    );

    console.log(
      "Highest results returned:",
      leaderboard.length
    );

    console.log(
      "Students:",
      totalStudents
    );

    console.log(
      "Average:",
      responseStats.averageScore
    );

    console.log(
      "Highest:",
      responseStats.highestScore
    );

    console.log(
      "======================================\n"
    );


    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({

      success: true,

      count:
        leaderboard.length,

      stats:
        responseStats,

      data:
        leaderboard,

    });

  } catch (error) {

    console.error(
      "❌ GET LEADERBOARD ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Failed to load leaderboard",

    });

  }

};


// =====================================================
// HELPER
// GET RESULT PERCENTAGE
// =====================================================

const getResultPercentage = (result) => {

  const storedPercentage =
    Number(
      result?.percentage
    );


  if (
    Number.isFinite(
      storedPercentage
    )
  ) {

    return Math.min(
      100,
      Math.max(
        0,
        storedPercentage
      )
    );

  }


  const score =
    Number(
      result?.score
    ) || 0;


  const total =
    Number(
      result?.totalQuestions
    ) || 0;


  if (total <= 0) {
    return 0;
  }


  return Math.min(
    100,
    Math.max(
      0,
      (score / total) * 100
    )
  );

};


// =====================================================
// GET SINGLE RESULT
// GET /api/leaderboard/:id
//
// ADMIN:
//     Can view any result
//
// STUDENT:
//     Can view only their own result
// =====================================================

const getLeaderboardById =
  async (req, res) => {

    try {

      const {
        id,
      } = req.params;


      // -------------------------------------------------
      // VALIDATE ID
      // -------------------------------------------------

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid leaderboard result ID",

        });

      }


      // -------------------------------------------------
      // AUTHENTICATED USER
      // -------------------------------------------------

      const loggedInUser =
        await getAuthenticatedUser(req);


      if (!loggedInUser) {

        return res.status(401).json({

          success: false,

          message:
            "Authentication required",

        });

      }


      // -------------------------------------------------
      // FIND RESULT
      // -------------------------------------------------

      const result =
        await Leaderboard.findById(id)
          .lean();


      if (!result) {

        return res.status(404).json({

          success: false,

          message:
            "Leaderboard entry not found",

        });

      }


      // -------------------------------------------------
      // ADMIN
      // -------------------------------------------------

      if (
        String(
          loggedInUser.role
        ).toLowerCase() === "admin"
      ) {

        return res.status(200).json({

          success: true,

          data:
            result,

        });

      }


      // -------------------------------------------------
      // STUDENT
      // -------------------------------------------------

      if (
        String(
          loggedInUser.role
        ).toLowerCase() === "student"
      ) {

        const loggedInUserId =
          String(
            loggedInUser._id
          );


        const resultUserId =
          result.userId
            ? String(result.userId)
            : "";


        const loggedInEmail =
          String(
            loggedInUser.email || ""
          )
            .trim()
            .toLowerCase();


        const resultEmail =
          String(
            result.email ||
            result.studentEmail ||
            ""
          )
            .trim()
            .toLowerCase();


        const isOwner =
          (
            resultUserId &&
            resultUserId ===
              loggedInUserId
          ) ||
          (
            loggedInEmail &&
            resultEmail &&
            loggedInEmail ===
              resultEmail
          );


        if (!isOwner) {

          return res.status(403).json({

            success: false,

            message:
              "You are not allowed to view this result",

          });

        }


        return res.status(200).json({

          success: true,

          data:
            result,

        });

      }


      return res.status(403).json({

        success: false,

        message:
          "Access denied",

      });

    } catch (error) {

      console.error(
        "❌ GET RESULT ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          error.message ||
          "Failed to load leaderboard entry",

      });

    }

  };


// =====================================================
// DELETE RESULT
// ADMIN ONLY
// DELETE /api/leaderboard/:id
// =====================================================

const deleteLeaderboard =
  async (req, res) => {

    try {

      const {
        id,
      } = req.params;


      // -------------------------------------------------
      // VALIDATE ID
      // -------------------------------------------------

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid leaderboard result ID",

        });

      }


      // -------------------------------------------------
      // ADMIN CHECK
      // -------------------------------------------------

      if (
        !req.user ||
        String(
          req.user.role
        ).toLowerCase() !== "admin"
      ) {

        return res.status(403).json({

          success: false,

          message:
            "Admin access required",

        });

      }


      // -------------------------------------------------
      // FIND RESULT
      // -------------------------------------------------

      const result =
        await Leaderboard.findById(id);


      if (!result) {

        return res.status(404).json({

          success: false,

          message:
            "Leaderboard result not found",

        });

      }


      // -------------------------------------------------
      // DELETE
      // -------------------------------------------------

      await Leaderboard.findByIdAndDelete(
        id
      );


      console.log(
        "🗑 Leaderboard result deleted:",
        id
      );


      return res.status(200).json({

        success: true,

        message:
          "Leaderboard result deleted successfully",

      });

    } catch (error) {

      console.error(
        "❌ DELETE LEADERBOARD ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          error.message ||
          "Failed to delete leaderboard result",

      });

    }

  };


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

  saveLeaderboard,

  getLeaderboard,

  getLeaderboardById,

  deleteLeaderboard,

};