import fs from "fs";
import mongoose from "mongoose";
import Problem from "../models/Problem.model.js"; // adjust path

const MONGO_URI = "mongodb+srv://abhijeet62008:5nHhIz12uMQJrb9e@remote-interview.ydeneb1.mongodb.net/?appName=remote-interview";

async function exportTags() {
  await mongoose.connect(MONGO_URI);

  const tags = await Problem.aggregate([
    {
      $match: {
        topicTags: { $exists: true, $ne: [] },
      },
    },
    { $unwind: "$topicTags" },
    {
      $group: {
        _id: "$topicTags.slug",
        slug: { $first: "$topicTags.slug" },
        name: { $first: "$topicTags.name" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        slug: 1,
        name: 1,
        count: 1,
      },
    },
    { $sort: { name: 1 } },
  ]);

  // Save JSON file
  fs.writeFileSync(
    "./problem-tags.json",
    JSON.stringify(tags, null, 2)
  );

  console.log("✅ Tags exported to /problem-tags.json");

  await mongoose.disconnect();
}

exportTags().catch(console.error);