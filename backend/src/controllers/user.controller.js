import FriendRequest from "../models/FriendRequests.model.js";
import User from "../models/user.model.js";
export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user._id || req.user.userId; // Use userId from req.user if available
    const currentUser = await User.findById(currentUserId);
    const usersThatSentRequestToCurrentUser = await FriendRequest.find({
      recipient: currentUserId,
      status: "pending",
    }).select("sender");
    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, //exclude current user
        { _id: { $nin: currentUser.friends } }, // exclude current user's friends
        { isOnboarded: true },
        { _id: { $nin: usersThatSentRequestToCurrentUser.map((req) => req.sender) } }, // exclude users who sent friend requests to current user
      ],
    });
    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriends(req, res) {
  try {
    const currentUser = await User.findById(req.user._id)
      .select("friends")
      .populate("friends", "fullName profilePic nativeLanguage bio");

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(currentUser.friends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function sendRequest(req, res) {
  try {
    
    const sender = req.user._id;
    const receiver = req.params.userId;
    const senderObject = await User.findById(sender);
    if (sender === receiver) {
      return res
        .status(400)
        .json({ message: "You can't send a request to yourself" });
    }
    const recipient = await User.findById(receiver);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    //check if user already friends
    if (senderObject.friends.includes(receiver)) {
      return res
        .status(400)
        .json({ message: "You already friends to this user" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: sender, recipient: receiver },
        { sender: receiver, recipient: sender },
      ],
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "pending friend request already exist" });
    }
    const newRequest = new FriendRequest({
      sender,
      recipient: receiver,
    });
    await newRequest.save();
    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function acceptRequest(req, res) {
  try {
    const { requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Verify the current user is the recipient
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // Add each user to the other's friends array
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate(
      "sender",
      "fullName profilePic nativeLanguage learningLanguage"
    );

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.log("Error in getPendingFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingFriendRequests(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate(
      "recipient",
      "fullName profilePic nativeLanguage learningLanguage"
    );

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
