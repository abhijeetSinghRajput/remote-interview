import { getAuth, requireAuth } from "@clerk/express";
import User from "../models/User.model.js";
import { sendError } from "../utils/response.js";

export const protect = async (req, res, next) => {
  const { userId, isAuthenticated } = getAuth(req);
  if (!isAuthenticated) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    return sendError(res, "User not found", 404);
  }
  req.user = user;
  next();
};
