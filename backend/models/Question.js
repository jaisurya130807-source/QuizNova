const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    // Topic name
    // Example: Java, Python, DBMS
    topic: {
      type: String,
      required: true,
      trim: true,
    },

    // Question text
    question: {
      type: String,
      required: true,
      trim: true,
    },

    // Exactly 4 options
    options: {
      type: [String],
      required: true,

      validate: {
        validator: function (value) {
          return (
            Array.isArray(value) &&
            value.length === 4 &&
            value.every(
              (option) =>
                typeof option === "string" &&
                option.trim().length > 0
            )
          );
        },

        message:
          "A question must have exactly 4 non-empty options.",
      },
    },

    // Correct answer
    answer: {
      type: String,
      required: true,
      trim: true,
    },

    // Question explanation
    explanation: {
      type: String,
      default: "",
      trim: true,
    },

    // Question order inside a topic
    order: {
      type: Number,
      default: 1,
      min: 1,
    },

    // Difficulty
    difficulty: {
      type: String,
      enum: [
        "Easy",
        "Medium",
        "Hard",
      ],
      default: "Medium",
    },

    // Question status
    status: {
      type: String,
      enum: [
        "Active",
        "Inactive",
      ],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);


// ==================================================
// VALIDATE ANSWER
// ==================================================

questionSchema.pre(
  "validate",
  function (next) {
    if (
      Array.isArray(this.options) &&
      this.options.length === 4 &&
      this.answer &&
      !this.options.includes(this.answer)
    ) {
      return next(
        new Error(
          "Correct answer must match one of the options."
        )
      );
    }

    next();
  }
);


module.exports = mongoose.model(
  "Question",
  questionSchema
);