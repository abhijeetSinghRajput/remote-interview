import { Router } from "express";
import { serve } from "inngest/express";
import { inngest, functions } from "../libs/inngest.js";
import { protect } from "../middlewares/protect.middleware.js";
import chatRoute from "./chat.route.js";
import problemRoute from "./problem.route.js";
import sessionRoute from "./session.route.js";

const router = Router();

router.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date() });
});

router.use("/inngest", serve({ client: inngest, functions }));
router.use("/chat", protect, chatRoute);
router.use("/sessions", protect, sessionRoute);
router.use("/problems", problemRoute);

export default router;
