import crypto from "crypto";
import OTP from "../models/OTP.js";
import { sendEmailIfConfigured } from "./email.js";

export const generateOTP = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
};

export const sendOTP = async (email) => {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.deleteMany({ email });

    await OTP.create({
        email,
        otp,
        expiresAt,
        attempts: 0
    });

    const emailSent = await sendEmailIfConfigured({
        to: email,
        subject: "Your Community Problem Solver OTP",
        text: `Your OTP is: ${otp}\n\nThis OTP will expire in 10 minutes. Do not share this with anyone.`
    });

    return { sent: emailSent.sent };
};

export const verifyOTP = async (email, otp) => {
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
        return { valid: false, message: "OTP not found or expired" };
    }

    if (otpRecord.attempts >= 3) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return { valid: false, message: "Too many attempts. Request a new OTP" };
    }

    if (otpRecord.expiresAt < new Date()) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return { valid: false, message: "OTP expired" };
    }

    if (otpRecord.otp !== otp) {
        await OTP.updateOne({ _id: otpRecord._id }, { $inc: { attempts: 1 } });
        return { valid: false, message: "Invalid OTP" };
    }

    await OTP.deleteOne({ _id: otpRecord._id });
    return { valid: true, message: "OTP verified successfully" };
};
