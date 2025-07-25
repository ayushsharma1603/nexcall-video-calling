import FriendRequest from "../models/FriendRequests.model.js";
export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.userId;
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const recommendedUsers = await User.find({
      _id: { $ne: currentUserId, $nin: currentUser.friends },
      isOnboarded: true,
    })
      .select("fullName profilePic nativeLanguage bio")
      .lean();

    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error fetching recommended users:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getFriends(req, res) {
  try {
    const currentUser = await User.findById(req.user.userId)
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
    if (sender.friends.includes(receiver)) {
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
    const { id: requestId } = req.params;

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

    // add each user to the other's friends array
    // $addToSet: adds elements to an array only if they do not already exist.
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller", error.message);
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
