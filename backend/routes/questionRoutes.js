const express = require("express");
const router = express.Router();

const Question = require("../models/Question");

// ========================================
// GET ALL QUESTIONS
// GET /api/questions
// ========================================

router.get("/", async (req, res) => {
  try {
    const questions = await Question.find()
      .sort({
        createdAt: 1,
      });

    res.status(200).json(questions);
  } catch (error) {
    console.error(
      "GET ALL QUESTIONS ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch questions",
    });
  }
});

// ========================================
// GET QUESTIONS BY TOPIC
// GET /api/questions/topic/Java
// ========================================

router.get(
  "/topic/:topic",
  async (req, res) => {
    try {
      const topic =
        req.params.topic.trim();

      const questions =
        await Question.find({
          topic: {
            $regex: `^${topic}$`,
            $options: "i",
          },
        }).sort({
          createdAt: 1,
        });

      res.status(200).json(questions);
    } catch (error) {
      console.error(
        "GET TOPIC QUESTIONS ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch topic questions",
      });
    }
  }
);

// ========================================
// GET ONE QUESTION
// GET /api/questions/:id
// ========================================

router.get(
  "/:id",
  async (req, res) => {
    try {
      const question =
        await Question.findById(
          req.params.id
        );

      if (!question) {
        return res.status(404).json({
          message:
            "Question not found",
        });
      }

      res.status(200).json(question);
    } catch (error) {
      console.error(
        "GET QUESTION ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch question",
      });
    }
  }
);

// ========================================
// ADD QUESTION
// POST /api/questions
// ========================================

router.post(
  "/",
  async (req, res) => {
    try {
      const {
        topic,
        question,
        options,
        answer,
      } = req.body;

      if (
        !topic ||
        !question ||
        !options ||
        !answer
      ) {
        return res.status(400).json({
          message:
            "Topic, question, options and answer are required",
        });
      }

      if (
        !Array.isArray(options)
      ) {
        return res.status(400).json({
          message:
            "Options must be an array",
        });
      }

      if (options.length !== 4) {
        return res.status(400).json({
          message:
            "Exactly 4 options are required",
        });
      }

      const cleanOptions =
        options.map((option) =>
          String(option).trim()
        );

      const cleanAnswer =
        String(answer).trim();

      if (
        !cleanOptions.includes(
          cleanAnswer
        )
      ) {
        return res.status(400).json({
          message:
            "Answer must match one of the options",
        });
      }

      const newQuestion =
        new Question({
          topic: String(topic).trim(),
          question:
            String(question).trim(),
          options: cleanOptions,
          answer: cleanAnswer,
        });

      const savedQuestion =
        await newQuestion.save();

      res.status(201).json({
        success: true,
        message:
          "Question created successfully",
        question:
          savedQuestion,
      });
    } catch (error) {
      console.error(
        "CREATE QUESTION ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to create question",
        error:
          error.message,
      });
    }
  }
);

// ========================================
// UPDATE QUESTION
// PUT /api/questions/:id
// ========================================

router.put(
  "/:id",
  async (req, res) => {
    try {
      const {
        topic,
        question,
        options,
        answer,
      } = req.body;

      if (
        !topic ||
        !question ||
        !options ||
        !answer
      ) {
        return res.status(400).json({
          message:
            "Topic, question, options and answer are required",
        });
      }

      if (
        !Array.isArray(options) ||
        options.length !== 4
      ) {
        return res.status(400).json({
          message:
            "Exactly 4 options are required",
        });
      }

      const cleanOptions =
        options.map((option) =>
          String(option).trim()
        );

      const cleanAnswer =
        String(answer).trim();

      if (
        !cleanOptions.includes(
          cleanAnswer
        )
      ) {
        return res.status(400).json({
          message:
            "Answer must match one of the options",
        });
      }

      const updatedQuestion =
        await Question.findByIdAndUpdate(
          req.params.id,
          {
            topic:
              String(topic).trim(),
            question:
              String(question).trim(),
            options:
              cleanOptions,
            answer:
              cleanAnswer,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!updatedQuestion) {
        return res.status(404).json({
          message:
            "Question not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Question updated successfully",
        question:
          updatedQuestion,
      });
    } catch (error) {
      console.error(
        "UPDATE QUESTION ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update question",
        error:
          error.message,
      });
    }
  }
);

// ========================================
// DELETE QUESTION
// DELETE /api/questions/:id
// ========================================

router.delete(
  "/:id",
  async (req, res) => {
    try {
      const deletedQuestion =
        await Question.findByIdAndDelete(
          req.params.id
        );

      if (!deletedQuestion) {
        return res.status(404).json({
          message:
            "Question not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Question deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE QUESTION ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete question",
      });
    }
  }
);

module.exports = router;