import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { upsertStreamUser } from "../lib/stream.js";
import SignupOtp from "../models/signupOtp.model.js";
import { sendSignupOtpEmail } from "../lib/brevo.js";

const OTP_TTL_MINUTES = Number(process.env.SIGNUP_OTP_TTL_MINUTES || 10);
const MAX_OTP_ATTEMPTS = Number(process.env.SIGNUP_OTP_MAX_ATTEMPTS || 5);

function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

function createOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashOtp(email, otp) {
  return crypto
    .createHash("sha256")
    .update(`${normalizeEmail(email)}:${otp}`)
    .digest("hex");
}

function getRandomAvatar() {
  const idx = Math.floor(Math.random() * 100 + 1);
  return `https://avatar.iran.liara.run/public/${idx}.png`;
}

function sanitizeUser(user) {
  const userObject = user.toObject ? user.toObject() : { ...user };
  delete userObject.password;
  return userObject;
}

function setAuthCookie(res, user) {
  const payload = {
    email: user.email,
    userId: user._id,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function validateSignupPayload({ email, password, fullName }) {
  if (!email || !password || !fullName) {
    return "All fields are required";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }

  if (fullName.trim().length < 3) {
    return "Full name must be at least 3 characters";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }

  return null;
}

// ======================== SIGNUP ========================
export async function signup(req, res) {
  const email = normalizeEmail(req.body.email);
  const password = req.body.password?.trim() || "";
  const fullName = req.body.fullName?.trim() || "";

  try {
    const validationError = validateSignupPayload({ email, password, fullName });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = createOtp();
    const otpExpiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
    const passwordHash = await bcrypt.hash(password, 10);

    await SignupOtp.findOneAndUpdate(
      { email },
      {
        email,
        fullName,
        passwordHash,
        otpHash: hashOtp(email, otp),
        otpExpiresAt,
        verificationAttempts: 0,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    await sendSignupOtpEmail({
      email,
      fullName,
      otp,
      expiresInMinutes: OTP_TTL_MINUTES,
    });

    res.status(200).json({
      success: true,
      email,
      expiresInMinutes: OTP_TTL_MINUTES,
      message: "Verification code sent successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

export async function verifySignupOtp(req, res) {
  const email = normalizeEmail(req.body.email);
  const otp = req.body.otp?.trim() || "";

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const pendingSignup = await SignupOtp.findOne({ email });
    if (!pendingSignup) {
      return res.status(400).json({
        message: "OTP expired or signup request not found. Please request a new code.",
      });
    }

    if (pendingSignup.otpExpiresAt.getTime() <= Date.now()) {
      await SignupOtp.deleteOne({ _id: pendingSignup._id });
      return res.status(400).json({
        message: "OTP expired. Please request a new code.",
      });
    }

    if (pendingSignup.verificationAttempts >= MAX_OTP_ATTEMPTS) {
      await SignupOtp.deleteOne({ _id: pendingSignup._id });
      return res.status(400).json({
        message: "Too many incorrect attempts. Please request a new code.",
      });
    }

    if (pendingSignup.otpHash !== hashOtp(email, otp)) {
      pendingSignup.verificationAttempts += 1;
      await pendingSignup.save();

      const remainingAttempts = MAX_OTP_ATTEMPTS - pendingSignup.verificationAttempts;
      if (remainingAttempts <= 0) {
        await SignupOtp.deleteOne({ _id: pendingSignup._id });
        return res.status(400).json({
          message: "Too many incorrect attempts. Please request a new code.",
        });
      }

      return res.status(400).json({
        message: `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} left.`,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await SignupOtp.deleteOne({ _id: pendingSignup._id });
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      email,
      password: pendingSignup.passwordHash,
      fullName: pendingSignup.fullName,
      profilePic: getRandomAvatar(),
    });

    await newUser.save();
    await SignupOtp.deleteOne({ _id: pendingSignup._id });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic,
      });
    } catch (err) {
      console.error("Error creating stream user:", err);
    }

    setAuthCookie(res, newUser);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    console.error("Verify signup OTP error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

// ======================== LOGIN ========================
export async function login(req, res) {
  const email = normalizeEmail(req.body.email);
  const password = req.body.password?.trim() || "";

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

    setAuthCookie(res, user);

    res.status(200).json({
      message: "Logged in successfully",
      user: sanitizeUser(user),
    });
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
      console.error(
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
