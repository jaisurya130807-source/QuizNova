const mongoose = require("mongoose");


const leaderboardSchema =
  new mongoose.Schema(
    {

      /*
      -----------------------------------------------
      REGISTERED USER ID
      -----------------------------------------------
      */

      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },


      /*
      -----------------------------------------------
      STUDENT NAME
      -----------------------------------------------
      */

      username: {
        type: String,
        required: true,
        trim: true,
      },


      studentName: {
        type: String,
        trim: true,
        default: "",
      },


      /*
      -----------------------------------------------
      STUDENT EMAIL
      -----------------------------------------------
      */

      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: "",
      },


      studentEmail: {
        type: String,
        trim: true,
        lowercase: true,
        default: "",
      },


      /*
      -----------------------------------------------
      QUIZ TOPIC
      -----------------------------------------------
      */

      category: {
        type: String,
        required: true,
        trim: true,
      },


      /*
      -----------------------------------------------
      SCORE
      -----------------------------------------------
      */

      score: {
        type: Number,
        required: true,
        min: 0,
      },


      /*
      -----------------------------------------------
      TOTAL QUESTIONS
      -----------------------------------------------
      */

      totalQuestions: {
        type: Number,
        required: true,
        min: 0,
      },


      /*
      -----------------------------------------------
      PERCENTAGE
      -----------------------------------------------
      */

      percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },

    },

    {
      timestamps: true,
    }

  );


module.exports =
  mongoose.model(
    "Leaderboard",
    leaderboardSchema
  );