import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.log(
    "Missing API key or secret. Please set them in your environment variables."
  );
  process.exit(1);
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

//create a new user in StreamChat

export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUser(userData);
    console.log(`User ${userData.id} created successfully.`);
    return userData;
  } catch (error) {
    console.error(`Error creating user: ${error}`);
  }
};

export const streamToken = async (userId) => {
  try {
    // ensure userId is a string
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating Stream token:", error);
  }
};
