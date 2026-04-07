import { streamChat } from "../libs/stream.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const getStreamToken = async (req, res, next) => {
  try {
    const { user } = req;
    const token = await streamChat.createToken(user.clerkId);
    return sendSuccess(res, { 
      token, 
      userId: user.clerkId,
      image: user.image,
      name: user.name
     }, "Stream token generated successfully");
  } catch (error) {
    console.error("Error generating stream token:", error);
    sendError(res, "Failed to get stream token", 500, [error.message]);
  }
};
