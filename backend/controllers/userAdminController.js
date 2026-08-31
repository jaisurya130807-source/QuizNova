const mongoose = require("mongoose");
const User = require("../models/User");

/*
====================================================
GET ALL STUDENTS
GET /api/admin/users
====================================================
*/

const getStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
    })
      .select("-password")
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: students.length,
      users: students,
    });
  } catch (error) {
    console.error("Get Students Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};


/*
====================================================
DELETE STUDENT
DELETE /api/admin/users/:id
====================================================
*/

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    /*
    -----------------------------------------------
    CHECK MONGODB ID
    -----------------------------------------------
    */

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }


    /*
    -----------------------------------------------
    FIND USER
    -----------------------------------------------
    */

    const student = await User.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student account not found",
      });
    }


    /*
    -----------------------------------------------
    NEVER DELETE AN ADMIN USING THIS ROUTE
    -----------------------------------------------
    */

    if (student.role !== "student") {
      return res.status(403).json({
        success: false,
        message:
          "This account is an administrator and cannot be deleted from the student section.",
      });
    }


    /*
    -----------------------------------------------
    DELETE STUDENT
    -----------------------------------------------
    */

    await User.findByIdAndDelete(id);


    /*
    -----------------------------------------------
    SUCCESS
    -----------------------------------------------
    */

    return res.status(200).json({
      success: true,
      message: "Student account deleted successfully",
      deletedUser: {
        id: student._id,
        name: student.name,
        email: student.email,
      },
    });
  } catch (error) {
    console.error("Delete Student Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete student account",
      error: error.message,
    });
  }
};


module.exports = {
  getStudents,
  deleteStudent,
};