import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import User from "../models/User.js";
import Problem from "../models/Problem.js";
import Solution from "../models/Solution.js";
import Vote from "../models/Vote.js";
import Discussion from "../models/Discussion.js";
import Tracking from "../models/Tracking.js";
import Notification from "../models/Notification.js";

dotenv.config();

const primaryEmail = "suman.tati2005@gmail.com";
const volunteers = [
    { state: "Andhra Pradesh", email: "andhra.volunteer@cps.local", password: "Andhra@123" },
    { state: "Bihar", email: "bihar.volunteer@cps.local", password: "Bihar@123" },
    { state: "Delhi", email: "delhi.volunteer@cps.local", password: "Delhi@123" },
    { state: "Gujarat", email: "gujarat.volunteer@cps.local", password: "Gujarat@123" },
    { state: "Karnataka", email: "karnataka.volunteer@cps.local", password: "Karnataka@123" },
    { state: "Kerala", email: "kerala.volunteer@cps.local", password: "Kerala@123" },
    { state: "Madhya Pradesh", email: "mp.volunteer@cps.local", password: "MP@123" },
    { state: "Maharashtra", email: "maharashtra.volunteer@cps.local", password: "Maharashtra@123" },
    { state: "Rajasthan", email: "rajasthan.volunteer@cps.local", password: "Rajasthan@123" },
    { state: "Uttar Pradesh", email: "up.volunteer@cps.local", password: "UP@123" }
];

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URL);

    const hashedDefaultPassword = await bcrypt.hash("123456", 10);
    const hashedAdminPassword = await bcrypt.hash("Suman@2005", 10);

    let primaryUser = await User.findOne({ email: primaryEmail });
    if (!primaryUser) {
        primaryUser = await User.create({
            name: "Suman Tati",
            email: primaryEmail,
            password: hashedAdminPassword,
            role: "admin",
            volunteerStatus: "approved"
        });
    } else {
        primaryUser.password = hashedAdminPassword;
        primaryUser.role = "admin";
        primaryUser.volunteerStatus = "approved";
        await primaryUser.save();
    }

    let helperUser = await User.findOne({ email: "charan.mock@cps.local" });
    if (!helperUser) {
        helperUser = await User.create({
            name: "Charan Mock",
            email: "charan.mock@cps.local",
            password: hashedDefaultPassword,
            role: "user",
            volunteerStatus: "none"
        });
    } else {
        helperUser.password = hashedDefaultPassword;
        helperUser.role = helperUser.role || "user";
        helperUser.volunteerStatus = helperUser.volunteerStatus || "none";
        await helperUser.save();
    }

    for (const entry of volunteers) {
        const { state, email, password } = entry;
        const hashedVolunteerPassword = await bcrypt.hash(password, 10);
        let volunteer = await User.findOne({ email });
        if (!volunteer) {
            await User.create({
                name: `${state} Volunteer`,
                email,
                password: hashedVolunteerPassword,
                role: "volunteer",
                volunteerStatus: "approved",
                city: state
            });
        } else {
            volunteer.password = hashedVolunteerPassword;
            volunteer.role = "volunteer";
            volunteer.volunteerStatus = "approved";
            volunteer.city = state;
            await volunteer.save();
        }
    }

    const existing = await Problem.find({ user: primaryUser._id }).limit(1);
    if (existing.length === 0) {
        const problems = await Problem.insertMany([
            {
                title: "Streetlight Not Working Near Main Road",
                description: "The streetlight near the bus stop on Main Road has not been working for over a week. Area is dark at night and unsafe.",
                user: primaryUser._id,
                location: "Main Road Bus Stop",
                city: "Delhi",
                status: "open"
            },
            {
                title: "Garbage Overflow in Community Park",
                description: "Dustbins are overflowing in Greenview Park and waste is spreading around. Needs urgent cleanup and more bins.",
                user: primaryUser._id,
                location: "Greenview Community Park",
                city: "Maharashtra",
                status: "in-progress"
            },
            {
                title: "Potholes on School Route",
                description: "Multiple potholes are causing traffic and risk for school children on Lakeview School Route.",
                user: primaryUser._id,
                location: "Lakeview School Route",
                city: "Karnataka",
                status: "completed"
            }
        ]);

        const [p1, p2, p3] = problems;

        const solutions = await Solution.insertMany([
            {
                problemId: p1._id,
                user: helperUser._id,
                description: "Raise a municipality maintenance ticket and attach two night-time photos for quick action.",
                votes: 2
            },
            {
                problemId: p2._id,
                user: helperUser._id,
                description: "Place temporary waste collection point and schedule daily pickup for one week.",
                votes: 3
            },
            {
                problemId: p3._id,
                user: helperUser._id,
                description: "Mark potholes with paint and prioritize patchwork before monsoon.",
                votes: 5
            }
        ]);

        await Vote.create({ userId: primaryUser._id, solutionId: solutions[0]._id });

        await Discussion.insertMany([
            {
                problemId: p1._id,
                user: primaryUser._id,
                message: "I have uploaded latest photos for better visibility."
            },
            {
                problemId: p2._id,
                user: helperUser._id,
                message: "Local volunteers are ready to support temporary cleanup."
            }
        ]);

        await Tracking.insertMany([
            { problemId: p1._id, status: "open", note: "Reported by resident", updatedBy: primaryUser._id },
            { problemId: p2._id, status: "in-progress", note: "Assigned to sanitation team", updatedBy: helperUser._id },
            { problemId: p3._id, status: "completed", note: "Repair work finished", updatedBy: helperUser._id }
        ]);

        await Notification.insertMany([
            {
                user: primaryUser._id,
                title: "Welcome to Community Problem Solver",
                message: "Your account is ready and mock data has been added for testing.",
                type: "system",
                link: "/dashboard"
            },
            {
                user: primaryUser._id,
                title: "Solution Received",
                message: "A community member suggested a solution to your reported issue.",
                type: "solution",
                link: `/problems/${p1._id}`
            }
        ]);
    }

    const summary = {
        seededFor: primaryEmail,
        primaryUserId: String(primaryUser._id),
        problemsByPrimaryUser: await Problem.countDocuments({ user: primaryUser._id }),
        helperUserSolutions: await Solution.countDocuments({ user: helperUser._id }),
        volunteerCount: await User.countDocuments({ role: "volunteer" }),
        totalDiscussions: await Discussion.countDocuments(),
        loginPasswordForSeededUsers: "123456",
        superAdminPassword: "Suman@2005",
        volunteerLogins: volunteers
    };

    console.log(JSON.stringify(summary, null, 2));
    await mongoose.disconnect();
};

run().catch(async (error) => {
    console.error("Seed failed:", error);
    try {
        await mongoose.disconnect();
    } catch {}
    process.exit(1);
});
