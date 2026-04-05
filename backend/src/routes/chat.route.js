import { Router } from "express";
import { getStreamToken } from "../controller/chat.controller.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Chat route is working" });
});
router.get("/token", getStreamToken);


export default router;