import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      minlength: 3,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },
    profilePic: {
      type: String,
      default: "",
    },
    nativeLanguage: {
      type: String,
      default: "",
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      default: "",
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

//pre save hook to hash password

//pre save hook must be called before creating model

// When you define a Mongoose model using mongoose.model(...), it freezes the schema. Any middleware like .pre("save") must be added before this line. Otherwise, the middleware won’t work and password won’t be hashed.

userSchema.pre("save", async function (next) {
  if (!this.isModified("password"))
    return next("password must be modified before saving");
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
