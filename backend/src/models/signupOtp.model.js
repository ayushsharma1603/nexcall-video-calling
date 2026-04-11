import mongoose from "mongoose";

const signupOtpSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      minlength: 3,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    otpExpiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
    verificationAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

const SignupOtp = mongoose.model("SignupOtp", signupOtpSchema);

export default SignupOtp;
