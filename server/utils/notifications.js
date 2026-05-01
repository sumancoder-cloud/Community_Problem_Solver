import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { sendEmailIfConfigured } from "./email.js";

export const createNotification = async ({ userId, title, message, type = "system", link = "", emailSubject, emailText }) => {
    const notification = await Notification.create({
        user: userId,
        title,
        message,
        type,
        link
    });

    if (emailSubject || emailText) {
        const user = await User.findById(userId).select("email name");
        if (user?.email) {
            await sendEmailIfConfigured({
                to: user.email,
                subject: emailSubject || title,
                text: emailText || message
            });
        }
    }

    return notification;
};