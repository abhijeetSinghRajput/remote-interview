import { Router } from "express";
import { serve } from "inngest/express";
import { inngest, functions } from "../libs/inngest.js";
import { protect } from "../middlewares/protect.middleware.js";
import chatRoute from "./chat.route.js";

const router = Router();

router.use("/inngest", serve({ client: inngest, functions }));
router.use("/chat", protect, chatRoute);

export default router;
