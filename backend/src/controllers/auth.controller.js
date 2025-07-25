import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { upsertStreamUser } from "../lib/stream.js";

// ======================== SIGNUP ========================
export async function signup(req, res) {
  const { email, password, fullName } = req.body;

  try {
    // 1. Validate required fields
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // 3. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (fullName.length < 3) {
      return res
        .status(400)
        .json({ message: "Full name must be at least 3 characters" });
    }

    // 4. Generate avatar
    const idx = Math.floor(Math.random() * 100 + 1);
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    // 5. Create and save user (password will be hashed via pre-save hook)
    const newUser = new User({
      email,
      password,
      fullName,
      profilePic: randomAvatar,
    });

    await newUser.save();

    // 6. Upsert Stream User (wrapped in try-catch)
    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic,
      });
    } catch (err) {
      console.error("Error creating stream user:", err);
    }

    // 7. Generate JWT Token
    const payload = {
      email: newUser.email,
      userId: newUser._id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 8. Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    // 9. Send response
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error("Signup error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

// ======================== LOGIN ========================
export async function login(req, res) {
  const { email, password } = req.body;

  // 1. Validate input
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    // 4. Create JWT token
    const payload = {
      email: user.email,
      userId: user._id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 5. Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ message: "Logged in successfully", user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// ======================== LOGOUT ========================
export function logout(req, res) {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
}

// ======================== ONBOARD ========================
export async function onboard(req, res) {
  try {
    const userId = req.user._id;
    const { fullName, bio, location, nativeLanguage } = req.body;

    if (!fullName || !bio || !location || !nativeLanguage) {
      const missingFields = [
        !fullName && "fullName",
        !bio && "bio",
        !location && "location",
        !nativeLanguage && "nativeLanguage",
      ].filter(Boolean);

      return res.status(400).json({
        message: "All fields are required",
        missingFields,
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        bio,
        location,
        nativeLanguage,
        isOnboarded: true,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User onboarded successfully:", updatedUser.fullName);
    // Upsert Stream User (wrapped in try-catch)
    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic,
      });
    } catch (StreamErr) {
      console.Stramor(
        "Error creating stream user: in auth controller",
        StreamErr
      );
    }

    res.status(200).json({
      message: "User onboarded successfully",
      success: true,
      updatedUser: updatedUser,
    });
  } catch (error) {
    console.error("Onboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
