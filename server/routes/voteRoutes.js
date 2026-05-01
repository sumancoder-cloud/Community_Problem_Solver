import { Router } from "express";
import { voteSolution, removeVote } from "../controllers/voteController.js";

const router = Router()

router.post('/upvote/:solutionId', voteSolution)
router.delete('/downvote/:solutionId', removeVote)

export default router;