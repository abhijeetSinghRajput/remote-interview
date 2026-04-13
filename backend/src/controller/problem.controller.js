import { sendError, sendSuccess } from "../utils/response.js";
import Problem from "../models/Problem.model.js";
import ProblemDetail from "../models/ProblemDetail.model.js";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 100;

const parsePositiveInt = (val, fallback) => {
  const n = parseInt(val, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

const parseTags = (raw) => {
  if (!raw) return [];
  return raw
    .split(/[+,\s]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
};

const normalizeDifficulty = (val) => {
  if (!val) return null;
  const s = val.trim();
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const getProblems = async (req, res) => {
  try {
    const limit = Math.min(parsePositiveInt(req.query.limit, DEFAULT_LIMIT), MAX_LIMIT);
    const skip = parsePositiveInt(req.query.skip, 0);
    const tags = parseTags(req.query.tags);
    const difficulty = normalizeDifficulty(req.query.difficulty);
    const search = req.query.search?.trim();

    const filter = { isPaidOnly: true };

    if (difficulty) {
      if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
        return sendError(res, "Invalid difficulty. Use: Easy | Medium | Hard", 400);
      }
      filter.difficulty = difficulty;
    }

    if (tags.length > 0) {
      filter["topicTags.slug"] = { $all: tags };
    }

    if (search) {
      const safeSearch = escapeRegex(search);
      const orConditions = [
        { title: { $regex: safeSearch, $options: "i" } },
        { titleSlug: { $regex: safeSearch, $options: "i" } },
        { "topicTags.name": { $regex: safeSearch, $options: "i" } },
        { "topicTags.slug": { $regex: safeSearch, $options: "i" } },
      ];

      // only search numeric id if search is a number
      if (/^\d+$/.test(search)) {
        orConditions.push({ questionFrontendId: Number(search) });
      }

      filter.$or = orConditions;
    }

    const [problems, total] = await Promise.all([
      Problem.find(
        filter,
        {
          questionFrontendId: 1,
          title: 1,
          titleSlug: 1,
          difficulty: 1,
          topicTags: 1,
          isUnlocked: 1,
          isPaidOnly: 1,
          _id: 0,
        }
      )
        .sort({ questionFrontendId: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Problem.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      meta: {
        total,
        limit,
        skip,
        returned: problems.length,
        hasMore: skip + limit < total,
        nextSkip: skip + limit < total ? skip + limit : null,
      },
      problems,
    });
  } catch (error) {
    console.error("[getProblems]", error);
    return sendError(res, "Internal server error", 500);
  }
};

export const getProblemBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const problem = await ProblemDetail.findOne(
      { titleSlug: slug },
      { _id: 0, __v: 0 }
    ).lean();

    if (!problem) {
      return sendError(res, `Problem "${slug}" not found`, 404);
    }

    return sendSuccess(res, { problem });
  } catch (error) {
    console.error("[getProblemBySlug]", error);
    return sendError(res, "Internal server error", 500);
  }
};