import Notification from "../models/Notification.js";

export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(100);

        return res.status(200).json({ message: "Notifications found successfully", notifications });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};

export const markNotificationRead = async (req, res) => {
    try {
        const notification = await Notification.findOne({ _id: req.params.id, user: req.user.id });
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        notification.isRead = true;
        await notification.save();

        return res.status(200).json({ message: "Notification marked as read", notification });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};

export const markAllNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user.id, isRead: false }, { $set: { isRead: true } });
        return res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};