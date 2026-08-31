const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");
require("dotenv").config();

const User = require("./models/User");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createAdmin() {
  try {
    console.log("");
    console.log("======================================");
    console.log("          QUIZNOVA ADMIN SETUP");
    console.log("======================================");
    console.log("");

    // Check MongoDB connection string
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI is missing.");
      console.error("");
      console.error("Please check your backend/.env file.");
      process.exit(1);
    }

    // Get admin details
    const name = (await ask("Enter admin name: ")).trim();

    const email = (await ask("Enter admin email: "))
      .trim()
      .toLowerCase();

    const password = await ask("Enter admin password: ");

    // Validate name
    if (!name) {
      console.error("");
      console.error("❌ Admin name cannot be empty.");
      rl.close();
      process.exit(1);
    }

    // Validate email
    if (!email) {
      console.error("");
      console.error("❌ Admin email cannot be empty.");
      rl.close();
      process.exit(1);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      console.error("");
      console.error("❌ Please enter a valid email address.");
      rl.close();
      process.exit(1);
    }

    // Validate password
    if (!password) {
      console.error("");
      console.error("❌ Password cannot be empty.");
      rl.close();
      process.exit(1);
    }

    if (password.length < 6) {
      console.error("");
      console.error("❌ Password must contain at least 6 characters.");
      rl.close();
      process.exit(1);
    }

    // Connect to MongoDB
    console.log("");
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB connected.");
    console.log("");

    // Check whether the user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("⚠️ A user with this email already exists.");
      console.log("");

      // Update existing user
      existingUser.name = name;
      existingUser.password = await bcrypt.hash(password, 10);
      existingUser.role = "admin";

      await existingUser.save();

      console.log("✅ Existing account has been converted to ADMIN.");
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new admin
      const admin = new User({
        name,
        email,
        password: hashedPassword,
        role: "admin",
      });

      await admin.save();

      console.log("✅ New ADMIN account created.");
    }

    console.log("");
    console.log("======================================");
    console.log("          ADMIN ACCOUNT READY");
    console.log("======================================");
    console.log("");
    console.log(`Name  : ${name}`);
    console.log(`Email : ${email}`);
    console.log("Role  : admin");
    console.log("");
    console.log("You can now login to QuizNova.");
    console.log("");

  } catch (error) {
    console.error("");
    console.error("❌ ADMIN SETUP FAILED");
    console.error("--------------------------------------");

    if (error.code === 11000) {
      console.error("A user with this email already exists.");
    } else if (error.name === "MongooseServerSelectionError") {
      console.error("Could not connect to MongoDB.");
      console.error("");
      console.error("Make sure MongoDB is running on your laptop.");
    } else {
      console.error(error.message);
    }

    console.error("");

    process.exitCode = 1;

  } finally {
    rl.close();

    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      // Ignore disconnect errors
    }
  }
}

createAdmin();