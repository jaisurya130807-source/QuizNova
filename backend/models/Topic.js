const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    /*
    ================================================
    TOPIC NAME
    ================================================
    */

    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    /*
    ================================================
    TOPIC DESCRIPTION
    ================================================
    */

    description: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    ================================================
    TIME PER QUESTION

    Admin can choose:
    5 seconds
    6 seconds
    7 seconds
    ...
    60 seconds

    Example:
    Java       = 30 seconds
    Python     = 60 seconds
    DBMS       = 15 seconds
    Aptitude   = 45 seconds
    ================================================
    */

    timePerQuestion: {
      type: Number,
      required: true,
      min: 5,
      max: 60,
      default: 30,
      validate: {
        validator: Number.isInteger,
        message:
          "Time per question must be a whole number.",
      },
    },

    /*
    ================================================
    TOPIC ACTIVE STATUS
    ================================================
    */

    isActive: {
      type: Boolean,
      default: true,
    },
  },

  /*
  ================================================
  AUTOMATIC CREATED / UPDATED DATES
  ================================================
  */

  {
    timestamps: true,
  }
);


/*
====================================================
INDEX
====================================================

Topic names must be unique.
====================================================
*/

topicSchema.index(
  { name: 1 },
  { unique: true }
);


/*
====================================================
EXPORT MODEL
====================================================
*/

module.exports = mongoose.model(
  "Topic",
  topicSchema
);