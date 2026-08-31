const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Topic = require("../models/Topic");
const Question = require("../models/Question");
const Leaderboard = require("../models/Leaderboard");


/*
====================================================
HELPER
====================================================
*/

// Accept all timer names used by the frontend/backend.
const getTimerValue = (body) => {
  if (
    body.timePerQuestion !== undefined &&
    body.timePerQuestion !== null &&
    body.timePerQuestion !== ""
  ) {
    return Number(body.timePerQuestion);
  }

  if (
    body.questionTimeSeconds !== undefined &&
    body.questionTimeSeconds !== null &&
    body.questionTimeSeconds !== ""
  ) {
    return Number(body.questionTimeSeconds);
  }

  if (
    body.durationSeconds !== undefined &&
    body.durationSeconds !== null &&
    body.durationSeconds !== ""
  ) {
    return Number(body.durationSeconds);
  }

  if (
    body.duration !== undefined &&
    body.duration !== null &&
    body.duration !== ""
  ) {
    return Number(body.duration);
  }

  return 30;
};


const validateTimer = (value) => {
  return (
    Number.isInteger(value) &&
    value >= 5 &&
    value <= 60
  );
};


/*
====================================================
STUDENT MANAGEMENT
====================================================
*/


/*
----------------------------------------------------
GET ALL STUDENTS
----------------------------------------------------

GET /api/admin/users
----------------------------------------------------
*/

const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: "student",
    })
      .select("-password")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(
      "Get Students Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};


/*
----------------------------------------------------
DELETE STUDENT ACCOUNT
----------------------------------------------------

DELETE /api/admin/users/:id
----------------------------------------------------
*/

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student account not found",
      });
    }

    if (
      String(user.role).toLowerCase() ===
      "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Administrator accounts cannot be deleted here",
      });
    }

    if (
      String(user.role).toLowerCase() !==
      "student"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only student accounts can be deleted",
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "Student account deleted successfully",

      deletedUser: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Delete Student Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete student account",
      error: error.message,
    });
  }
};


/*
====================================================
ADMINISTRATOR MANAGEMENT
====================================================
*/


/*
----------------------------------------------------
GET ALL ADMINISTRATORS
----------------------------------------------------

GET /api/admin/admins
----------------------------------------------------
*/

const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({
      role: "admin",
    })
      .select("-password")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: admins.length,
      admins,
    });
  } catch (error) {
    console.error(
      "Get Admins Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch administrators",
      error: error.message,
    });
  }
};


/*
----------------------------------------------------
CREATE ADMINISTRATOR
----------------------------------------------------

POST /api/admin/admins
----------------------------------------------------
*/

const createAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;


    // ==========================================
    // VALIDATE NAME
    // ==========================================

    if (
      !name ||
      !String(name).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Admin name is required",
      });
    }


    // ==========================================
    // VALIDATE EMAIL
    // ==========================================

    if (
      !email ||
      !String(email).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Admin email is required",
      });
    }


    // ==========================================
    // VALIDATE PASSWORD
    // ==========================================

    if (!password) {
      return res.status(400).json({
        success: false,
        message:
          "Admin password is required",
      });
    }


    if (
      String(password).length < 6
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Admin password must contain at least 6 characters",
      });
    }


    // ==========================================
    // CLEAN DATA
    // ==========================================

    const cleanName =
      String(name).trim();

    const cleanEmail =
      String(email)
        .trim()
        .toLowerCase();


    // ==========================================
    // CHECK EXISTING EMAIL
    // ==========================================

    const existingUser =
      await User.findOne({
        email: cleanEmail,
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }


    // ==========================================
    // HASH PASSWORD
    // ==========================================

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );


    // ==========================================
    // CREATE ADMIN
    // ==========================================

    const admin =
      await User.create({
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        role: "admin",
      });


    // ==========================================
    // RETURN SAFE ADMIN DATA
    // ==========================================

    const adminResponse = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };


    return res.status(201).json({
      success: true,
      message:
        "Administrator created successfully",

      admin: adminResponse,
    });

  } catch (error) {
    console.error(
      "Create Admin Error:",
      error
    );


    // MongoDB duplicate email
    if (
      error.code === 11000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }


    return res.status(500).json({
      success: false,
      message:
        "Failed to create administrator",
      error: error.message,
    });
  }
};


/*
----------------------------------------------------
DELETE ADMINISTRATOR
----------------------------------------------------

DELETE /api/admin/admins/:id
----------------------------------------------------
*/

const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;


    // ==========================================
    // VALIDATE ID
    // ==========================================

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Administrator ID is required",
      });
    }


    if (
      !mongoose.isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid administrator ID",
      });
    }


    // ==========================================
    // FIND ADMIN
    // ==========================================

    const admin =
      await User.findById(id);


    if (!admin) {
      return res.status(404).json({
        success: false,
        message:
          "Administrator account not found",
      });
    }


    // ==========================================
    // MAKE SURE IT IS AN ADMIN
    // ==========================================

    if (
      String(admin.role).toLowerCase() !==
      "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only administrator accounts can be deleted here",
      });
    }


    // ==========================================
    // DELETE ADMIN
    // ==========================================

    await User.findByIdAndDelete(id);


    return res.status(200).json({
      success: true,

      message:
        "Administrator deleted successfully",

      deletedAdmin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

  } catch (error) {
    console.error(
      "Delete Admin Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete administrator",
      error: error.message,
    });
  }
};


/*
====================================================
ADMIN STATISTICS
====================================================
*/

const getStats = async (req, res) => {
  try {

    const totalStudents =
      await User.countDocuments({
        role: "student",
      });


    const totalTopics =
      await Topic.countDocuments();


    const totalQuestions =
      await Question.countDocuments();


    const totalAttempts =
      await Leaderboard.countDocuments();


    const totalAdmins =
      await User.countDocuments({
        role: "admin",
      });


    return res.status(200).json({
      success: true,

      stats: {
        totalStudents,
        totalTopics,
        totalQuestions,
        totalAttempts,
        totalAdmins,
      },
    });

  } catch (error) {

    console.error(
      "Get Admin Stats Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch statistics",
      error: error.message,
    });
  }
};


/*
====================================================
TOPIC MANAGEMENT
====================================================
*/


/*
----------------------------------------------------
GET ALL TOPICS
----------------------------------------------------
*/

const getTopics = async (req, res) => {
  try {
    const topics =
      await Topic.find()
        .sort({
          createdAt: -1,
        })
        .lean();


    const topicsWithQuestionCount =
      await Promise.all(
        topics.map(async (topic) => {

          const escapedTopicName =
            String(topic.name).replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
            );


          const questionCount =
            await Question.countDocuments({
              topic: {
                $regex:
                  `^${escapedTopicName}$`,
                $options: "i",
              },
            });


          const timer =
            Number(
              topic.timePerQuestion
            ) || 30;


          return {
            ...topic,

            timePerQuestion:
              timer,

            questionTimeSeconds:
              timer,

            durationSeconds:
              timer,

            questionCount,
          };
        })
      );


    return res.status(200).json({
      success: true,
      count:
        topicsWithQuestionCount.length,
      topics:
        topicsWithQuestionCount,
    });

  } catch (error) {

    console.error(
      "Get Topics Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch topics",
      error: error.message,
    });
  }
};


/*
----------------------------------------------------
CREATE TOPIC
----------------------------------------------------
*/

const createTopic = async (req, res) => {
  try {

    const {
      name,
      description,
      isActive,
    } = req.body;


    if (
      !name ||
      !String(name).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Topic name is required",
      });
    }


    const topicName =
      String(name).trim();


    const existingTopic =
      await Topic.findOne({
        name: topicName,
      });


    if (existingTopic) {
      return res.status(400).json({
        success: false,
        message:
          "Topic already exists",
      });
    }


    const timerValue =
      getTimerValue(req.body);


    if (
      !validateTimer(timerValue)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Time per question must be between 5 and 60 seconds",
      });
    }


    const topic =
      await Topic.create({

        name:
          topicName,

        description:
          description
            ? String(
                description
              ).trim()
            : "",

        timePerQuestion:
          timerValue,

        isActive:
          typeof isActive ===
          "boolean"
            ? isActive
            : true,
      });


    return res.status(201).json({
      success: true,

      message:
        "Topic created successfully",

      topic: {
        ...topic.toObject(),

        timePerQuestion:
          timerValue,

        questionTimeSeconds:
          timerValue,

        durationSeconds:
          timerValue,

        questionCount: 0,
      },
    });

  } catch (error) {

    console.error(
      "Create Topic Error:",
      error
    );


    if (
      error.code === 11000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Topic already exists",
      });
    }


    return res.status(500).json({
      success: false,
      message:
        "Failed to create topic",
      error: error.message,
    });
  }
};


/*
----------------------------------------------------
UPDATE TOPIC
----------------------------------------------------
*/

const updateTopic = async (req, res) => {
  try {

    const topic =
      await Topic.findById(
        req.params.id
      );


    if (!topic) {
      return res.status(404).json({
        success: false,
        message:
          "Topic not found",
      });
    }


    const {
      name,
      description,
      isActive,
    } = req.body;


    if (name !== undefined) {

      const newName =
        String(name).trim();


      if (!newName) {
        return res.status(400).json({
          success: false,
          message:
            "Topic name cannot be empty",
        });
      }


      const duplicateTopic =
        await Topic.findOne({
          name: newName,
          _id: {
            $ne:
              req.params.id,
          },
        });


      if (duplicateTopic) {
        return res.status(400).json({
          success: false,
          message:
            "Another topic already has this name",
        });
      }


      const oldName =
        topic.name;


      if (
        oldName !== newName
      ) {

        await Question.updateMany(
          {
            topic:
              oldName,
          },

          {
            $set: {
              topic:
                newName,
            },
          }
        );
      }


      topic.name =
        newName;
    }


    if (
      description !== undefined
    ) {

      topic.description =
        String(
          description || ""
        ).trim();
    }


    const timerWasSent =
      req.body.timePerQuestion !==
        undefined ||
      req.body.questionTimeSeconds !==
        undefined ||
      req.body.durationSeconds !==
        undefined ||
      req.body.duration !==
        undefined;


    if (timerWasSent) {

      const timerValue =
        getTimerValue(
          req.body
        );


      if (
        !validateTimer(
          timerValue
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Time per question must be between 5 and 60 seconds",
        });
      }


      topic.timePerQuestion =
        timerValue;
    }


    if (
      isActive !== undefined
    ) {

      topic.isActive =
        Boolean(isActive);
    }


    await topic.save();


    const escapedTopicName =
      String(
        topic.name
      ).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );


    const questionCount =
      await Question.countDocuments({
        topic: {
          $regex:
            `^${escapedTopicName}$`,
          $options: "i",
        },
      });


    const timer =
      Number(
        topic.timePerQuestion
      ) || 30;


    return res.status(200).json({
      success: true,

      message:
        "Topic updated successfully",

      topic: {
        ...topic.toObject(),

        timePerQuestion:
          timer,

        questionTimeSeconds:
          timer,

        durationSeconds:
          timer,

        questionCount,
      },
    });

  } catch (error) {

    console.error(
      "Update Topic Error:",
      error
    );


    if (
      error.code === 11000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Topic already exists",
      });
    }


    return res.status(500).json({
      success: false,
      message:
        "Failed to update topic",
      error: error.message,
    });
  }
};


/*
----------------------------------------------------
DELETE TOPIC
----------------------------------------------------
*/

const deleteTopic = async (req, res) => {
  try {

    const topic =
      await Topic.findById(
        req.params.id
      );


    if (!topic) {
      return res.status(404).json({
        success: false,
        message:
          "Topic not found",
      });
    }


    const escapedTopicName =
      String(
        topic.name
      ).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );


    const deletedQuestions =
      await Question.deleteMany({
        topic: {
          $regex:
            `^${escapedTopicName}$`,
          $options: "i",
        },
      });


    await Topic.findByIdAndDelete(
      req.params.id
    );


    return res.status(200).json({
      success: true,

      message:
        "Topic and all its questions deleted successfully",

      deletedQuestions:
        deletedQuestions.deletedCount,
    });

  } catch (error) {

    console.error(
      "Delete Topic Error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Failed to delete topic",
      error: error.message,
    });
  }
};


/*
====================================================
QUESTION MANAGEMENT
====================================================
*/


/*
----------------------------------------------------
GET ALL QUESTIONS
----------------------------------------------------
*/

const getQuestions = async (req, res) => {
  try {

    const questions =
      await Question.find()
        .sort({
          createdAt: 1,
        })
        .lean();


    return res.status(200).json({
      success: true,

      count:
        questions.length,

      questions,
    });

  } catch (error) {

    console.error(
      "Get Questions Error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch questions",
      error: error.message,
    });
  }
};


/*
----------------------------------------------------
CREATE QUESTION
----------------------------------------------------
*/

const createQuestion = async (
  req,
  res
) => {
  try {

    const {
      topic,
      question,
      options,
      answer,
      explanation,
      order,
      difficulty,
      status,
    } = req.body;


    // ==========================================
    // TOPIC
    // ==========================================

    if (
      !topic ||
      !String(topic).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Topic is required",
      });
    }


    const topicName =
      String(topic).trim();


    const existingTopic =
      await Topic.findOne({
        name:
          topicName,
      });


    if (!existingTopic) {
      return res.status(404).json({
        success: false,
        message:
          "The selected topic does not exist",
      });
    }


    // ==========================================
    // QUESTION
    // ==========================================

    if (
      !question ||
      !String(question).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Question is required",
      });
    }


    // ==========================================
    // OPTIONS
    // ==========================================

    if (
      !Array.isArray(options) ||
      options.length !== 4
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Exactly 4 options are required",
      });
    }


    const cleanOptions =
      options.map(
        (option) =>
          String(option).trim()
      );


    if (
      cleanOptions.some(
        (option) =>
          !option
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All 4 options must contain text",
      });
    }


    // ==========================================
    // ANSWER
    // ==========================================

    if (
      !answer ||
      !String(answer).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Correct answer is required",
      });
    }


    const cleanAnswer =
      String(answer).trim();


    if (
      !cleanOptions.includes(
        cleanAnswer
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Correct answer must match one of the options",
      });
    }


    // ==========================================
    // DIFFICULTY
    // ==========================================

    const allowedDifficulty = [
      "Easy",
      "Medium",
      "Hard",
    ];


    const finalDifficulty =
      difficulty ||
      "Medium";


    if (
      !allowedDifficulty.includes(
        finalDifficulty
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Difficulty must be Easy, Medium or Hard",
      });
    }


    // ==========================================
    // STATUS
    // ==========================================

    const allowedStatus = [
      "Active",
      "Inactive",
    ];


    const finalStatus =
      status ||
      "Active";


    if (
      !allowedStatus.includes(
        finalStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be Active or Inactive",
      });
    }


    // ==========================================
    // CREATE QUESTION
    // ==========================================

    const newQuestion =
      await Question.create({

        topic:
          topicName,

        question:
          String(
            question
          ).trim(),

        options:
          cleanOptions,

        answer:
          cleanAnswer,

        explanation:
          explanation
            ? String(
                explanation
              ).trim()
            : "",

        order:
          Number.isInteger(
            Number(order)
          ) &&
          Number(order) >= 1
            ? Number(order)
            : 1,

        difficulty:
          finalDifficulty,

        status:
          finalStatus,
      });


    return res.status(201).json({
      success: true,

      message:
        "Question created successfully",

      question:
        newQuestion,
    });

  } catch (error) {

    console.error(
      "Create Question Error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Failed to create question",
      error: error.message,
    });
  }
};


/*
----------------------------------------------------
UPDATE QUESTION
----------------------------------------------------
*/

const updateQuestion = async (
  req,
  res
) => {
  try {

    const question =
      await Question.findById(
        req.params.id
      );


    if (!question) {
      return res.status(404).json({
        success: false,
        message:
          "Question not found",
      });
    }


    const {
      topic,
      question: questionText,
      options,
      answer,
      explanation,
      order,
      difficulty,
      status,
    } = req.body;


    // ==========================================
    // UPDATE TOPIC
    // ==========================================

    if (
      topic !== undefined
    ) {

      const topicName =
        String(topic).trim();


      if (!topicName) {
        return res.status(400).json({
          success: false,
          message:
            "Topic cannot be empty",
        });
      }


      const existingTopic =
        await Topic.findOne({
          name:
            topicName,
        });


      if (!existingTopic) {
        return res.status(404).json({
          success: false,
          message:
            "The selected topic does not exist",
        });
      }


      question.topic =
        topicName;
    }


    // ==========================================
    // UPDATE QUESTION TEXT
    // ==========================================

    if (
      questionText !==
      undefined
    ) {

      const cleanQuestion =
        String(
          questionText
        ).trim();


      if (!cleanQuestion) {
        return res.status(400).json({
          success: false,
          message:
            "Question cannot be empty",
        });
      }


      question.question =
        cleanQuestion;
    }


    // ==========================================
    // UPDATE OPTIONS
    // ==========================================

    if (
      options !== undefined
    ) {

      if (
        !Array.isArray(options) ||
        options.length !== 4
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Exactly 4 options are required",
        });
      }


      const cleanOptions =
        options.map(
          (option) =>
            String(
              option
            ).trim()
        );


      if (
        cleanOptions.some(
          (option) =>
            !option
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "All 4 options must contain text",
        });
      }


      question.options =
        cleanOptions;


      if (
        question.answer &&
        !cleanOptions.includes(
          question.answer
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "The existing correct answer is not present in the new options",
        });
      }
    }


    // ==========================================
    // UPDATE ANSWER
    // ==========================================

    if (
      answer !== undefined
    ) {

      const cleanAnswer =
        String(
          answer
        ).trim();


      if (!cleanAnswer) {
        return res.status(400).json({
          success: false,
          message:
            "Correct answer cannot be empty",
        });
      }


      if (
        !question.options.includes(
          cleanAnswer
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Correct answer must match one of the options",
        });
      }


      question.answer =
        cleanAnswer;
    }


    // ==========================================
    // UPDATE EXPLANATION
    // ==========================================

    if (
      explanation !==
      undefined
    ) {

      question.explanation =
        String(
          explanation || ""
        ).trim();
    }


    // ==========================================
    // UPDATE ORDER
    // ==========================================

    if (
      order !== undefined
    ) {

      const newOrder =
        Number(order);


      if (
        !Number.isInteger(
          newOrder
        ) ||
        newOrder < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Question order must be a positive whole number",
        });
      }


      question.order =
        newOrder;
    }


    // ==========================================
    // UPDATE DIFFICULTY
    // ==========================================

    if (
      difficulty !==
      undefined
    ) {

      const allowedDifficulty = [
        "Easy",
        "Medium",
        "Hard",
      ];


      if (
        !allowedDifficulty.includes(
          difficulty
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Difficulty must be Easy, Medium or Hard",
        });
      }


      question.difficulty =
        difficulty;
    }


    // ==========================================
    // UPDATE STATUS
    // ==========================================

    if (
      status !== undefined
    ) {

      const allowedStatus = [
        "Active",
        "Inactive",
      ];


      if (
        !allowedStatus.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Status must be Active or Inactive",
        });
      }


      question.status =
        status;
    }


    await question.save();


    return res.status(200).json({
      success: true,

      message:
        "Question updated successfully",

      question,
    });

  } catch (error) {

    console.error(
      "Update Question Error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Failed to update question",
      error: error.message,
    });
  }
};


/*
----------------------------------------------------
DELETE QUESTION
----------------------------------------------------
*/

const deleteQuestion = async (
  req,
  res
) => {
  try {

    const question =
      await Question.findByIdAndDelete(
        req.params.id
      );


    if (!question) {
      return res.status(404).json({
        success: false,
        message:
          "Question not found",
      });
    }


    return res.status(200).json({
      success: true,

      message:
        "Question deleted successfully",
    });

  } catch (error) {

    console.error(
      "Delete Question Error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Failed to delete question",
      error: error.message,
    });
  }
};


/*
====================================================
EXPORTS
====================================================
*/

module.exports = {

  // ==========================================
  // STUDENTS
  // ==========================================

  getUsers,
  deleteUser,


  // ==========================================
  // ADMINISTRATORS
  // ==========================================

  getAdmins,
  createAdmin,
  deleteAdmin,


  // ==========================================
  // STATISTICS
  // ==========================================

  getStats,


  // ==========================================
  // TOPICS
  // ==========================================

  getTopics,
  createTopic,
  updateTopic,
  deleteTopic,


  // ==========================================
  // QUESTIONS
  // ==========================================

  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};