import { sendError, sendSuccess } from "../utils/response.js";
import Problem from "../models/Problem.model.js";
import ProblemDetail from "../models/ProblemDetail.model.js";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT     = 100;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parsePositiveInt = (val, fallback) => {
  const n = parseInt(val, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const parseTags = (raw) => {
  if (!raw) return [];
  // handles: ?tags=dp+graph  ?tags=dp,graph  ?tags=dp graph
  return raw.split(/[+,\s]+/).map((t) => t.trim().toLowerCase()).filter(Boolean);
};

const normalizeDifficulty = (val) => {
  if (!val) return null;
  const s = val.trim();
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); // "EASY" → "Easy"
};

// ─── GET /problems ─────────────────────────────────────────────────────────────

export const getProblems = async (req, res) => {
  try {
    const limit      = Math.min(parsePositiveInt(req.query.limit, DEFAULT_LIMIT), MAX_LIMIT);
    const skip       = parsePositiveInt(req.query.skip, 0) || 0;
    const tags       = parseTags(req.query.tags);
    const difficulty = normalizeDifficulty(req.query.difficulty);

    // ── Filter ────────────────────────────────────────────────────────────────
    const filter = {};

    if (difficulty) {
      if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
        return sendError(res, 400, "Invalid difficulty. Use: Easy | Medium | Hard");
      }
      filter.difficulty = difficulty;
    }

    if (tags.length > 0) {
      // AND semantics — problem must have ALL requested tags
      filter["topicTags.slug"] = { $all: tags };
    }

    // ── Query (lightweight Problem model, no content/snippets) ────────────────
    const [problems, total] = await Promise.all([
      Problem.find(filter, {
        questionFrontendId: 1,
        title:              1,
        titleSlug:          1,
        difficulty:         1,
        topicTags:          1,
        isPaidOnly:         1,
        _id:                0,
      })
        .sort({ questionFrontendId: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Problem.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, {
      meta: {
        total,
        limit,
        skip,
        returned: problems.length,
        hasMore:  skip + limit < total,
        nextSkip: skip + limit < total ? skip + limit : null,
      },
      problems,
    });
  } catch (error) {
    console.error("[getProblems]", error);
    return sendError(res, 500, "Internal server error");
  }
};

// ─── GET /problems/:slug ───────────────────────────────────────────────────────

export const getProblemBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Uses ProblemDetail — full document with content, examples, snippets etc.
    const problem = await ProblemDetail
      .findOne({ titleSlug: slug }, { _id: 0, __v: 0 })
      .lean();

    if (!problem) {
      return sendError(res, 404, `Problem "${slug}" not found`);
    }

    if (problem.isPaidOnly) {
      return sendError(res, 403, "This problem is for premium subscribers only");
    }

    return sendSuccess(res, 200, { problem });
  } catch (error) {
    console.error("[getProblemBySlug]", error);
    return sendError(res, 500, "Internal server error");
  }
};