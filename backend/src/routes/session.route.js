import {Router} from "express";
import { protect } from "../middlewares/protect.middleware.js";
import * as sessionController from "../controller/session.controller.js";

const router = Router();

router.post("/", protect, sessionController.createSession);
router.get("/active", protect, sessionController.getActiveSession);
router.get("/my-recent", protect, sessionController.getMyRecentSessions);

router.get("/:id", protect, sessionController.getSessionById);
router.post("/:id/join", protect, sessionController.joinSession);
router.post("/:id/leave", protect, sessionController.leaveSession);
router.post("/:id/end", protect, sessionController.endSession);

export default router;