import { Router } from "express";
import { approveVolunteer, listPendingVolunteers, rejectVolunteer } from "../controllers/adminController.js";
import User from "../models/User.js";

const router = Router();

const requireAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("role");
        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Admin access only" });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};

router.get("/volunteers/pending", requireAdmin, listPendingVolunteers);
router.patch("/volunteers/approve/:userId", requireAdmin, approveVolunteer);
router.patch("/volunteers/reject/:userId", requireAdmin, rejectVolunteer);

export default router;
