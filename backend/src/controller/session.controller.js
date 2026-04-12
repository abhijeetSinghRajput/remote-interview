import { sendError, sendSuccess } from "../utils/response.js";
import Session from "../models/Session.model.js";
import { v4 as uuidv4 } from "uuid";
import { streamChat, streamClient } from "../libs/stream.js";
import Problem from "../models/Problem.model.js";

const parsePositiveInt = (value, fallback) => {
  const num = Number.parseInt(value, 10);
  return Number.isFinite(num) && num > 0 ? num : fallback;
};

export const createSession = async (req, res) => {
  try {
    const { user } = req;
    const { problemId } = req.body;

    if (!problemId) {
      return sendError(res, "Problem ID is required", 400);
    }

    const problem = await Problem.findById(problemId).lean();
    if (!problem) {
      return sendError(res, "Problem not found", 404);
    }

    const callId = uuidv4();

    const session = await Session.create({
      host: user._id,
      problem: problemId,
      callId,
    });

    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by_id: user.clerkId,
      },
    });

    const channel = streamChat.channel("messaging", callId, {
      name: `${problem.title} Session`,
      created_by_id: user.clerkId,
      members: [user.clerkId],
    });
    await channel.create();

    const populatedSession = await Session.findById(session._id)
      .populate("host", "name email image clerkId")
      .populate("participant", "name email image clerkId")
      .populate(
        "problem",
        [
          "questionId",
          "questionFrontendId",
          "title",
          "titleSlug",
          "difficulty",
          "isPaidOnly",
          "topicTags",
          "codeSnippets",
        ].join(" ")
      )
      .lean();

    return sendSuccess(res, populatedSession, "Session created successfully", 201);
  } catch (error) {
    console.error("Error creating session:", error);
    return sendError(res, "Failed to create session", 500, [error.message]);
  }
};

export const getActiveSession = async (req, res) => {
  try {
    const page = parsePositiveInt(req.query.page, 1);
    const limit = parsePositiveInt(req.query.limit, 10);
    const skip = (page - 1) * limit;

    const sessions = await Session.find({ status: "active" })
      .populate("host", "name email image clerkId")
      .populate("participant", "name email image clerkId")
      .populate(
        "problem",
        [
          "questionFrontendId",
          "title",
          "titleSlug",
          "difficulty",
          "isPaidOnly",
          "topicTags",
        ].join(" ")
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return sendSuccess(res, sessions, "Active sessions fetched successfully");
  } catch (error) {
    console.error("Error fetching active sessions:", error);
    return sendError(res, "Failed to fetch active sessions", 500, [error.message]);
  }
};

export const getMyRecentSessions = async (req, res) => {
  try {
    const { user } = req;
    const page = parsePositiveInt(req.query.page, 1);
    const limit = parsePositiveInt(req.query.limit, 10);
    const skip = (page - 1) * limit;

    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: user._id }, { participant: user._id }],
    })
      .populate("host", "name email image clerkId")
      .populate("participant", "name email image clerkId")
      .populate(
        "problem",
        [
          "questionFrontendId",
          "title",
          "titleSlug",
          "difficulty",
          "isPaidOnly",
          "topicTags",
        ].join(" ")
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return sendSuccess(res, sessions, "Recent sessions fetched successfully");
  } catch (error) {
    console.error("Error fetching recent sessions:", error);
    return sendError(res, "Failed to fetch recent sessions", 500, [error.message]);
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
        [
          "questionId",
          "questionFrontendId",
          "title",
          "titleSlug",
          "difficulty",
          "isPaidOnly",
          "topicTags",
          "codeSnippets",
        ].join(" ")
      )
      .lean();

    if (!session) {
      return sendError(res, "Session not found", 404);
    }

    return sendSuccess(res, session, "Session fetched successfully");
  } catch (error) {
    console.error("Error fetching session:", error);
    return sendError(res, "Failed to fetch session", 500, [error.message]);
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

    if (session.status === "completed") {
      return sendError(res, "Session is not active", 400);
    }

    if (session.host.toString() === user._id.toString()) {
      return sendError(res, "Host cannot join as participant", 400);
    }

    if (session.participant && session.participant.toString() === user._id.toString()) {
      return sendError(res, "User already joined the session", 400);
    }

    if (session.participant) {
      return sendError(res, "Session is already full", 409);
    }

    session.participant = user._id;
    await session.save();

    const channel = streamChat.channel("messaging", session.callId);
    await channel.addMembers([user.clerkId]);

    const populatedSession = await Session.findById(session._id)
      .populate("host", "name email image clerkId")
      .populate("participant", "name email image clerkId")
      .populate(
        "problem",
        [
          "questionId",
          "questionFrontendId",
          "title",
          "titleSlug",
          "difficulty",
          "isPaidOnly",
          "topicTags",
          "codeSnippets",
        ].join(" ")
      )
      .lean();

    return sendSuccess(res, populatedSession, "Joined session successfully");
  } catch (error) {
    console.error("Error joining session:", error);
    return sendError(res, "Failed to join session", 500, [error.message]);
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

    if (session.host.toString() === user._id.toString()) {
      return sendError(res, "Host cannot leave the session, end the session instead", 400);
    }

    if (!session.participant || session.participant.toString() !== user._id.toString()) {
      return sendError(res, "User is not a participant of the session", 400);
    }

    session.participant = null;
    await session.save();

    return sendSuccess(res, null, "Left session successfully");
  } catch (error) {
    console.error("Error leaving session:", error);
    return sendError(res, "Failed to leave session", 500, [error.message]);
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

    const call = streamClient.video.call("default", session.callId);
    await call.delete({ hard: true });

    const channel = streamChat.channel("messaging", session.callId);
    await channel.delete();

    return sendSuccess(res, null, "Session ended successfully");
  } catch (error) {
    console.error("Error ending session:", error);
    return sendError(res, "Failed to end session", 500, [error.message]);
  }
};