import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import { ENV } from "./config/env.js";
import router from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";

const app = express();

app.use(helmet());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(ENV.NODE_ENV === "development" ? "dev" : "combined"));

app.use(clerkMiddleware());
app.use("/api", router);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  app.listen(ENV.PORT, () => {
    console.log(`Server running on port ${ENV.PORT}`);
  });
};

start();
