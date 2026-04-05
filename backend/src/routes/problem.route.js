import { Router } from "express";
import { getProblems, getProblemBySlug } from "../controller/problem.controller.js";

const router = Router();

router.get("/", getProblems);
router.get("/:slug", getProblemBySlug);

export default router;