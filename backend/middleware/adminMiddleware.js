const jwt = require("jsonwebtoken");

const User = require("../models/User");


const protectAdmin = async (req, res, next) => {

  try {

    const authHeader =
      req.headers.authorization;


    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }


    const token =
      authHeader.split(" ")[1];


    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }


    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );


    const user =
      await User.findById(decoded.id)
        .select("-password");


    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }


    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }


    req.user = user;


    next();

  } catch (error) {

    console.error(
      "Admin Middleware Error:",
      error
    );


    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};


module.exports = {
  protectAdmin,
};