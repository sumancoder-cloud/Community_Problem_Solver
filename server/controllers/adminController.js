import User from "../models/User.js";
import { createNotification } from "../utils/notifications.js";

export const listPendingVolunteers = async (req, res) => {
    try {
        const pending = await User.find({ volunteerStatus: "pending" }).select("name email city volunteerStatus createdAt");
        return res.status(200).json({ message: "Pending volunteers", volunteers: pending });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};

export const approveVolunteer = async (req, res) => {
    try {
        const { userId } = req.params;
        const { city } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.role = "volunteer";
        user.volunteerStatus = "approved";
        if (city) {
            user.city = city;
        }
        await user.save();

        await createNotification({
            userId: user._id,
            title: "Volunteer application approved",
            message: `You are approved as a volunteer for ${user.city || "your city"}.`,
            type: "system",
            link: "/volunteer",
            emailSubject: "Volunteer approved",
            emailText: `You have been approved as a volunteer for ${user.city || "your city"}.`
        });

        return res.status(200).json({ message: "Volunteer approved", user: { id: user._id, name: user.name, email: user.email, role: user.role, city: user.city, volunteerStatus: user.volunteerStatus } });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};

export const rejectVolunteer = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.role = "user";
        user.volunteerStatus = "rejected";
        await user.save();

        await createNotification({
            userId: user._id,
            title: "Volunteer application rejected",
            message: "Your volunteer application was not approved at this time.",
            type: "system",
            link: "/dashboard",
            emailSubject: "Volunteer application update",
            emailText: "Your volunteer application was not approved at this time."
        });

        return res.status(200).json({ message: "Volunteer rejected" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};
