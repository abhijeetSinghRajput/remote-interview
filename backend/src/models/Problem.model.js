import mongoose from "mongoose";

const TopicTagSchema = new mongoose.Schema(
  {
    name: String,
    id: Number,
    slug: String,
  },
  { _id: false }
);


const ProblemSchema = new mongoose.Schema(
  {
    questionFrontendId: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    titleSlug: {
      type: String,
      required: true,
      unique: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    isPaidOnly: {
      type: Boolean,
      default: false,
    },
    topicTags: [TopicTagSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Question", ProblemSchema);