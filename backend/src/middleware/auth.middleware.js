import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

//middleware to authenticate JWT token and protect route

export const protectRoute = async (req, res, next) => {
  try {
    if (!req.cookies.token) {
      return res
        .status(401)
        .json({ message: "Unauthorized, token is required" });
    }
    const token = req.cookies.token;
    //verify token
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    if (!decode)
      return res
        .status(401)
        .json({ message: "Unauthorized, token is invalid" });
    const user = await User.findById(decode.userId).select("-password");
    if (!user)
      return res.status(401).json({ message: "Unauthorized, user not found" });
    req.user = user;
    next();
  } catch (error) {
    console.error("error in auth middleware :", error);
    res
      .status(500)
      .json({ message: "Server Error, could not authenticate user" });
  }
};
