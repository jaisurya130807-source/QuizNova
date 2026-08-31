const express = require("express");

const router = express.Router();

const Topic = require("../models/Topic");
const Question = require("../models/Question");

/*
====================================================
GET ACTIVE TOPICS FOR STUDENTS
GET /api/topics
====================================================

IMPORTANT:

The admin stores the timer in MongoDB as:

    timePerQuestion

This route MUST return that same value to the
student dashboard and quiz page.

Admin can choose:

5 seconds
6 seconds
7 seconds
...
60 seconds

Example:

JavaScript = 10 seconds
Python    = 30 seconds
C++       = 60 seconds
====================================================
*/

router.get("/", async (req, res) => {
  try {
    const topics = await Topic.find({
      isActive: true,
    }).sort({
      createdAt: 1,
    });

    const topicsWithQuestionCount =
      await Promise.all(
        topics.map(async (topic) => {
          /*
          ------------------------------------------------
          COUNT QUESTIONS FOR THIS TOPIC
          ------------------------------------------------
          */

          const escapedTopicName =
            topic.name.replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
            );

          const questionCount =
            await Question.countDocuments({
              topic: {
                $regex: `^${escapedTopicName}$`,
                $options: "i",
              },
            });

          /*
          ------------------------------------------------
          GET TIMER FROM MONGODB
          ------------------------------------------------

          IMPORTANT:
          The Topic model uses:

              timePerQuestion

          NOT:

              durationSeconds
          */

          let timer =
            Number(
              topic.timePerQuestion
            );

          /*
          ------------------------------------------------
          SAFETY CHECK
          ------------------------------------------------

          Timer must always be between
          5 and 60 seconds.
          */

          if (
            !Number.isInteger(timer) ||
            timer < 5 ||
            timer > 60
          ) {
            timer = 30;
          }

          /*
          ------------------------------------------------
          RETURN TOPIC
          ------------------------------------------------

          We return BOTH names:

              timePerQuestion
              durationSeconds

          This keeps the existing frontend compatible
          while making sure both contain the SAME
          correct timer.
          */

          return {
            _id: topic._id,

            name: topic.name,

            description:
              topic.description || "",

            /*
            ----------------------------------------------
            CORRECT ADMIN TIMER
            ----------------------------------------------
            */

            timePerQuestion: timer,

            /*
            ----------------------------------------------
            BACKWARD COMPATIBILITY
            ----------------------------------------------

            Dashboard/older frontend code may read
            durationSeconds.

            Therefore return the same timer here.
            ----------------------------------------------
            */

            durationSeconds: timer,

            isActive:
              topic.isActive,

            questionCount,
          };
        })
      );

    /*
    ----------------------------------------------------
    SEND RESPONSE
    ----------------------------------------------------
    */

    res.status(200).json({
      success: true,

      count:
        topicsWithQuestionCount.length,

      topics:
        topicsWithQuestionCount,
    });
  } catch (error) {
    console.error(
      "GET PUBLIC TOPICS ERROR:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Failed to fetch topics",

      error:
        error.message,
    });
  }
});

module.exports = router;