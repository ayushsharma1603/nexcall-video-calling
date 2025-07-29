import express from "express";
import {
  login,
  logout,
  onboard,
  signup,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

//onboarding
router.post("/onboarding", protectRoute, onboard);

//me route

router.get("/me", protectRoute, async (req, res) => {
  res.status(200).json({ user: req.user });
});

export default router;
