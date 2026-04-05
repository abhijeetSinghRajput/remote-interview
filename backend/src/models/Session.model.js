import { Schema, model } from "mongoose";

const sessionSchema = new Schema(
  {
    host: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problem: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    participant: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    callId: {
        type: String,
        default: "",
    }
  },
  { timestamps: true },
);

const Session = model("Session", sessionSchema);

export default Session;
