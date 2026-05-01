import { Router } from "express";
import { getAisuggestionsForProblem } from "../controllers/aiController.js";

const router = Router();

router.get('/suggestions/:problemId', getAisuggestionsForProblem);

export default router;