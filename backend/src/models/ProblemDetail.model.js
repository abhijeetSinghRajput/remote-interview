import mongoose from "mongoose";

const TopicTagSchema = new mongoose.Schema(
  { name: String, slug: String },
  { _id: false }
);

const CodeSnippetSchema = new mongoose.Schema(
  { lang: String, langSlug: String, code: String },
  { _id: false }
);

const ParamSchema = new mongoose.Schema(
  { name: String, type: String },
  { _id: false }
);

const ExampleSchema = new mongoose.Schema(
  { input: String, output: String, explanation: String },
  { _id: false }
);

// ── NEW: slim shape stored for each similar problem ───────────────────────────
const SimilarQuestionSchema = new mongoose.Schema(
  {
    title:      { type: String, default: "" },
    titleSlug:  { type: String, default: "" },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard", ""], default: "" },
  },
  { _id: false }
);

const ProblemDetailSchema = new mongoose.Schema(
  {
    questionFrontendId: { type: String, required: true, unique: true, index: true },
    questionId:         { type: String, required: true, index: true },
    title:              { type: String, required: true },
    titleSlug:          { type: String, required: true, unique: true, index: true },
    difficulty:         { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    isPaidOnly:         { type: Boolean, default: false },

    content:      { type: String, required: true },
    examples:     [ExampleSchema],
    constraints:  [String],
    topicTags:    [TopicTagSchema],
    hints:        [String],
    codeSnippets: [CodeSnippetSchema],

    functionMeta: {
      name:       String,
      params:     [ParamSchema],
      returnType: String,
      returnSize: Number,
      manual:     Boolean,
    },

    sampleTestCase:   String,
    exampleTestcases: String,

    // ── Added field ───────────────────────────────────────────────────────────
    similarQuestions: {
      type:    [SimilarQuestionSchema],
      default: undefined, // undefined = field absent until crawled (used for $exists check)
    },
  },
  { timestamps: true }
);

export default mongoose.model("ProblemDetail", ProblemDetailSchema);