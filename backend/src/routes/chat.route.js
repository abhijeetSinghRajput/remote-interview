import { Router } from "express";
import { getStreamToken } from "../controller/chat.controller.js";
import { protect } from "../middlewares/protect.middleware.js";

const router = Router();

router.get("/token", protect, getStreamToken);


export default router;