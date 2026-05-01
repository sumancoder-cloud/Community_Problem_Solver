import { Router } from "express";
import {
    createDiscussion,
    deleteDiscussion,
    getDiscussionsByProblemId,
    updateDiscussion
} from "../controllers/discussionController.js";

const router = Router();

router.post('/create/:problemId', createDiscussion);
router.get('/:problemId', getDiscussionsByProblemId);
router.put('/update/:id', updateDiscussion);
router.delete('/delete/:id', deleteDiscussion);

export default router;