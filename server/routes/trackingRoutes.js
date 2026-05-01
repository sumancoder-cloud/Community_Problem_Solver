import { Router } from "express";
import { createTrackingNote, getTrackingByProblemId } from "../controllers/trackingController.js";

const router = Router();

router.get('/:problemId', getTrackingByProblemId);
router.post('/note/:problemId', createTrackingNote);

export default router;