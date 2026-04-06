import { sendError, sendSuccess } from "../utils/response.js";
import Session from "../models/Session.model.js";
import { v4 as uuidv4 } from "uuid";
import { streamChat, streamClient } from "../libs/stream.js";
import Problem from "../models/Problem.model.js";

export const createSession = async (req, res) => {
  try {
    const { user } = req;
    const { problemId } = req.body;
    if (!problemId) {
      return sendError(res, "Problem ID is required", 400);
    }
    // check problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return sendError(res, "Problem not found", 404);
    }

    // generate unique callId for video session by uuid
    const callId = uuidv4();

    // create session in DB
    const session = await Session.create({
      host: user._id,
      problem: problemId,
      callId,
    });

    // create stream video call
    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by_id: user.clerkId,
      },
    });

    // create stream chat channel for this session
    const channel = streamChat.channel("messaging", callId, {
      name: `${problem.title} Session`,
      created_by_id: user.clerkId,
      members: [user.clerkId],
    });
    await channel.create();

    return sendSuccess(res, session, "Session created successfully", 201);
  } catch (error) {
    console.error("Error creating session:", error);
    sendError(res, "Failed to create session", 500, [error.message]);
  }
};

export const getActiveSession = async (req, res) => {
  try {
    // add pagination
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const sessions = await Session.find({ status: "active" })
      .populate("host", "name email image clerkId")
      .populate("problem", "title slug difficulty tags")
      .skip(skip)
      .limit(limit);

    return sendSuccess(res, sessions, "Active sessions fetched successfully");
  } catch (error) {
    console.error("Error fetching active session:", error);
    sendError(res, "Failed to fetch active session", 500, [error.message]);
  }
};

export const getMyRecentSessions = async (req, res) => {
  try {
    // add pagination
    const { user } = req;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: user._id }, { participant: user._id }],
    })
      .populate("problem", "title difficulty")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendSuccess(res, sessions, "Recent sessions fetched successfully");
  } catch (error) {
    console.error("Error fetching recent sessions:", error);
    sendError(res, "Failed to fetch recent sessions", 500, [error.message]);
  }
};

export const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findById(id)
      .populate("host", "name email image clerkId")
      .populate("participant", "name email image clerkId")
      .populate(
        "problem",
        "title slug description difficulty tags testCases codeStubs hints",
      );
    if (!session) {
      return sendError(res, "Session not found", 404);
    }
    return sendSuccess(res, session, "Session fetched successfully");
  } catch (error) {
    console.error("Error fetching session:", error);
    sendError(res, "Failed to fetch session", 500, [error.message]);
  }
};

export const joinSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { user } = req;
        
        const session = await Session.findById(id);
        if (!session) {
            return sendError(res, "Session not found", 404);
        }

        // status != completed
        // host != user
        // participant != user
        if (session.status === "completed") {
            return sendError(res, "Session is not active", 400);
        }
        if (session.host.toString() === user._id.toString()) {
            return sendError(res, "Host cannot join as participant", 400);
        }
        if(session.participant) {
            return sendError(res, "Session already has a full", 409);
        }
        if (session.participant.toString() === user._id.toString()) {
            return sendError(res, "User already joined the session", 400);
        }

        session.participant = user._id;
        await session.save();

        // add participant to stream video call
        await streamClient.video.call("default", session.callId).addMembers([user.clerkId]);

        // add participant to stream chat channel
        const channel = streamChat.channel("messaging", session.callId);
        await channel.addMembers([user.clerkId]);
    } catch (error) {
        console.error("Error joining session:", error);
        sendError(res, "Failed to join session", 500, [error.message]);
    }
};

export const leaveSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { user } = req;
        const session = await Session.findById(id);
        if (!session) {
            return sendError(res, "Session not found", 404);
        }
        // participant can leave the session, host will end the session
        if (session.host.toString() === user._id.toString()) {
            return sendError(res, "Host cannot leave the session, end the session instead", 400);
        }
        if (!session.participant || session.participant.toString() !== user._id.toString()) {
            return sendError(res, "User is not a participant of the session", 400);
        }
        session.participant = null;
        await session.save();
    } catch (error) {
        console.error("Error leaving session:", error);
        sendError(res, "Failed to leave session", 500, [error.message]);
    }
};

export const endSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { user } = req;
        const session = await Session.findById(id);
        if (!session) {
            return sendError(res, "Session not found", 404);
        }
        if (session.host.toString() !== user._id.toString()) {
            return sendError(res, "Only host can end the session", 400);
        } 
        session.status = "completed";
        await session.save();

        // end stream video call
        const call = streamClient.video.call("default", session.callId);
        await call.delete({hard: true});

        // delete stream chat channel
        const channel = streamChat.channel("messaging", session.callId);
        await channel.delete();

        return sendSuccess(res, session, "Session ended successfully");
    } catch (error) {
        console.error("Error ending session:", error);
        sendError(res, "Failed to end session", 500, [error.message]);
    }
};
