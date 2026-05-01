import { Router } from "express";
import { getAdminDashboard, getRegionAnalytics, getRegionsAnalytics, getVolunteerDashboard } from "../controllers/analyticsController.js";

const router = Router();

router.get("/regions", getRegionsAnalytics);
router.get("/region/:city", getRegionAnalytics);
router.get("/volunteer", getVolunteerDashboard);
router.get("/admin", getAdminDashboard);

export default router;
