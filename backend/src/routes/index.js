import { Router } from "express";
import { serve } from "inngest/express";
import { inngest, functions } from "../libs/inngest.js";

const router = Router();

router.use("/inngest", serve({ client: inngest, functions }));
router.get("/health", (req, res) => res.json({ status: "ok" }));
// router.use("/auth", authRoutes); todo

export default router;
