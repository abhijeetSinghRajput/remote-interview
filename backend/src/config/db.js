import { ENV } from "./env.js";
import ora from "ora";
import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

export const connectDB = async () => {
    const spinner = ora("Connecting to MongoDB...").start();
    try {
        const conn = await mongoose.connect(ENV.DB_URL);
        spinner.succeed("MongoDB connected");
    } catch (error) {
        spinner.fail("MongoDB connection failed");
        console.error(error);
        process.exit(1);
    }
}