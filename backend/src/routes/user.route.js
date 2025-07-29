import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptRequest,
  getFriendRequests,
  getFriends,
  getOutgoingFriendRequests,
  getRecommendedUsers,
  sendRequest,
} from "../controllers/user.controller.js";

const router = express.Router();

// apply auth middleware to all routes in this file

router.use(protectRoute);
router.get("/", getRecommendedUsers);
router.get("/friends", getFriends);

router.post("/send-friend-request/:userId", sendRequest);

router.put("/friend-request/accept/:requestId", acceptRequest);
router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendRequests);

export default router;
