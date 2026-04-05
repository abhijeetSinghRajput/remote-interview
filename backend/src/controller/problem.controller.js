import { sendError, sendSuccess } from "../utils/response.js";
import Problem from "../models/Problem.model.js";

export const getProblems = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 10); // cap at 50
  const skip = (page - 1) * limit;

  // filters
  const filter = {};
  if (req.query.difficulty) filter.difficulty = req.query.difficulty;
  if (req.query.tag) filter.tags = { $in: [req.query.tag] };
  if (req.query.search)
    filter.title = { $regex: req.query.search, $options: "i" };

  try {
    const [problems, total] = await Promise.all([
      Problem.find(filter)
        .select("uuid title slug difficulty tags stats createdAt") // never send testCases/solutions to list view
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Problem.countDocuments(filter),
    ]);

    sendSuccess(res, {
      problems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching problems:", error);
    sendError(res, "Error fetching problems", 500);
  }
};

export const getProblemBySlug = async (req, res) => {
  const { slug } = req.params; // id = uuid

  try {
    const problem = await Problem.findOne({ slug }).select(
      "-testCases -solutions",
    );
    if (!problem) {
      return sendError(res, "Problem not found", 404);
    }
    sendSuccess(res, { problem });
  } catch (error) {
    console.error("Error fetching problem:", error);
    sendError(res, "Error fetching problem", 500);
  }
};
