import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
  explanation: { type: String },
});

const codeStubSchema = new mongoose.Schema({
  language: {
    type: String,
    enum: ["javascript", "python", "java", "cpp"],
    required: true,
  },
  starterCode: { type: String, required: true },
  solutionCode: { type: String },
});


const problemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    // markdown, can include images, code, examples, constraints, etc.
    description: { type: String, required: true },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },

    tags: [{ type: String, trim: true }],

    testCases: [testCaseSchema], // hidden + visible test cases

    codeStubs: [codeStubSchema], // starter code per language

    hints: [{ type: String }],
  },
  { timestamps: true },
);

// auto-generate slug from title
problemSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");
  }
  next();
});


problemSchema.index({ difficulty: 1 });
problemSchema.index({ tags: 1 });

const Problem = mongoose.model("Problem", problemSchema);

export default Problem;
