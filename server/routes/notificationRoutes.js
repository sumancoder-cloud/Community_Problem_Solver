import { Router } from "express";
import { getMyNotifications, markAllNotificationsRead, markNotificationRead } from "../controllers/notificationController.js";

const router = Router();

router.get('/', getMyNotifications);
router.patch('/read-all', markAllNotificationsRead);
router.patch('/read/:id', markNotificationRead);

export default router;