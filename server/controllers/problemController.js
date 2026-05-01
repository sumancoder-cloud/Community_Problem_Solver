import mongoose from "mongoose";
import Problem from "../models/Problem.js"
import Tracking from "../models/Tracking.js"
import Solution from "../models/Solution.js"
import User from "../models/User.js"
import { createNotification } from "../utils/notifications.js"

const ensureProblemCity = (problem) => {
    if (!problem.city) {
        problem.city = "Unknown";
    }
};

export const createProblem = async (req, res) => {
    try {
        const {title, description, image, location, city} = req.body;
        if(!title || !description || !location || !city) {
            return res.status(400).json({message : "Title, Description, location, and city are mandatory"})
        }
        const problem = new Problem({title, description, user : req.user.id, image, location})
        problem.city = city;
        await problem.save()
        await Tracking.create({
            problemId: problem._id,
            status: problem.status,
            note: "Problem created",
            updatedBy: req.user.id
        })

        await createNotification({
            userId: req.user.id,
            title: "Problem posted successfully",
            message: `Your problem ${title} has been posted successfully.`,
            type: "problem",
            link: `/problems/${problem._id}`
        })

        res.status(201).json({message : "Problem Added Successfully", problem})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message : "Internal server Error"})
    }
}

export const getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find().populate("user", "name email").sort({ createdAt: -1 });
        res.status(200).json({message : "Problems found successfully", problems})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message : "Internal server Error"})
    }
}

export const getProblemById = async (req, res) => {
    try {
        const id = req.params.id
        const problem = await Problem.findById(id)
        if(!problem) {
            return res.status(404).json({message : "Problem Not Found"})
        }
        await problem.populate("user", "name email")
        await problem.populate({
            path: "selectedSolutionId",
            select: "description user votes createdAt",
            populate: {
                path: "user",
                select: "name email"
            }
        })
        res.status(200).json({message : "Problem Found", problem})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message : "Internal server Error"})
    }
}

export const selectSolutionForProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const { solutionId } = req.body;

        if (!solutionId) {
            return res.status(400).json({ message: "Solution ID is required" });
        }

        if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(solutionId)) {
            return res.status(400).json({ message: "Invalid problem or solution ID" });
        }

        const problem = await Problem.findById(id);
        if (!problem) {
            return res.status(404).json({ message: "Problem Not Found" });
        }

        if (!problem.user) {
            return res.status(400).json({ message: "Problem owner is missing" });
        }

        if (problem.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const solution = await Solution.findById(solutionId);
        if (!solution || solution.problemId.toString() !== id.toString()) {
            return res.status(400).json({ message: "Invalid solution for this problem" });
        }

        problem.selectedSolutionId = solutionId;
        ensureProblemCity(problem);
        await problem.save();

        await Tracking.create({
            problemId: problem._id,
            status: problem.status,
            note: "Selected a solution for implementation",
            updatedBy: req.user.id
        });

        if (solution.user && solution.user.toString() !== req.user.id.toString()) {
            await createNotification({
                userId: solution.user,
                title: "Your solution was selected",
                message: `Your solution for ${problem.title} was selected for implementation.`,
                type: "solution",
                link: `/problems/${problem._id}`,
                emailSubject: "Your solution was selected",
                emailText: `Good news! Your solution for ${problem.title} was selected for implementation.`
            });
        }

        await problem.populate({
            path: "selectedSolutionId",
            select: "description user votes createdAt",
            populate: {
                path: "user",
                select: "name email"
            }
        });

        return res.status(200).json({ message: "Solution selected successfully", problem });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};

export const updateProblemStatus = async (req, res) => {
    try {
        const id = req.params.id
        const problem = await Problem.findById(id)
        if(!problem) {
            return res.status(404).json({message : "Problem Not Found"})
        }
        const user = await User.findById(req.user.id).select("role city");
        const isOwner = problem.user.toString() === req.user.id.toString();
        const isVolunteer = user?.role === "volunteer";
        const isAdmin = user?.role === "admin";

        if (!isOwner && !isVolunteer && !isAdmin) {
            return res.status(403).json({message : "Unauthorized"})
        }
        const {status} = req.body;
        if(!status) {
            return res.status(400).json({message : "Status is required"})
        }
        if(!["open", "in-progress", "completed"].includes(status)) {
            return res.status(400).json({message : "Invalid status"})
        }
        if (status === "completed" && !(isVolunteer || isAdmin)) {
            return res.status(403).json({ message: "Completion requires volunteer approval" });
        }
        if (status === "completed" && !problem.completionRequested && !isAdmin) {
            return res.status(400).json({ message: "Completion must be approved through the volunteer flow" });
        }
        const currStatus = problem.status;
        const validUpdates = {
            "open" : ["in-progress"],
            "in-progress" : ["completed"],
            "completed" : []
        }
        if (problem.status === status) {
            return res.status(400).json({message: "Problem is already in this status"});
        }
        if(!validUpdates[currStatus].includes(status)) {
            return res.status(400).json({message : "Invalid status update"})
        }
        problem.status = status;
        ensureProblemCity(problem);
        if (status === "completed") {
            problem.completionRequested = false;
        }
        await problem.save()
        await Tracking.create({
            problemId: problem._id,
            status,
            note: `Status updated to ${status}`,
            updatedBy: req.user.id
        })

        await createNotification({
            userId: problem.user,
            title: "Problem status updated",
            message: `Your problem ${problem.title} status changed to ${status}.`,
            type: "status",
            link: `/problems/${problem._id}`,
            emailSubject: "Problem status updated",
            emailText: `The status of your problem titled ${problem.title} changed to ${status}.`
        })

        res.status(200).json({message : "Problem status updated successfully", problem})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message : "Internal server Error"})
    }
}

export const getMyProblems = async (req, res) => {
  try {
    const problems = await Problem.find({ user: req.user.id });

    res.json({ problems });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user problems" });
  }
};

export const requestCompletion = async (req, res) => {
    try {
        const id = req.params.id;
        const problem = await Problem.findById(id);
        if (!problem) {
            return res.status(404).json({ message: "Problem Not Found" });
        }

        if (problem.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (problem.status !== "in-progress") {
            return res.status(400).json({ message: "Completion can be requested only when in progress" });
        }

        if (problem.completionRequested) {
            return res.status(400).json({ message: "Completion is already requested" });
        }

        problem.completionRequested = true;
        ensureProblemCity(problem);
        await problem.save();

        await Tracking.create({
            problemId: problem._id,
            status: problem.status,
            note: "Completion requested by problem owner",
            updatedBy: req.user.id
        });

        return res.status(200).json({ message: "Completion requested", problem });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};

export const approveCompletion = async (req, res) => {
    try {
        const id = req.params.id;
        const problem = await Problem.findById(id);
        if (!problem) {
            return res.status(404).json({ message: "Problem Not Found" });
        }

        const user = await User.findById(req.user.id).select("role city");
        const isVolunteer = user?.role === "volunteer";
        const isAdmin = user?.role === "admin";

        if (!isVolunteer && !isAdmin) {
            return res.status(403).json({ message: "Only volunteers can approve completion" });
        }

        if (isVolunteer && user?.city && user.city !== problem.city) {
            return res.status(403).json({ message: "You can only approve completion for your city" });
        }

        if (!problem.completionRequested) {
            return res.status(400).json({ message: "Completion was not requested" });
        }

        problem.status = "completed";
        problem.completionRequested = false;
        ensureProblemCity(problem);
        await problem.save();

        await Tracking.create({
            problemId: problem._id,
            status: problem.status,
            note: "Completion approved by volunteer",
            updatedBy: req.user.id
        });

        await createNotification({
            userId: problem.user,
            title: "Problem marked completed",
            message: `A volunteer approved completion for ${problem.title}.`,
            type: "status",
            link: `/problems/${problem._id}`,
            emailSubject: "Problem completion approved",
            emailText: `Your problem "${problem.title}" was marked completed by a volunteer in ${problem.city}.`
        });

        return res.status(200).json({ message: "Completion approved", problem });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};

export const deleteProblem = async (req, res) => {
    try {
        const id = req.params.id
        const problem = await Problem.findById(id)
        // console.log("problem.user:", problem.user);
        // console.log("req.user:", req.user);
        if(!problem) {
            return res.status(404).json({message : "Problem Not Found"})
        }
        if(problem.user.toString() !== req.user.id.toString()){
            return res.status(403).json({message : "Unauthorized"})
        }
        await problem.deleteOne()
        res.status(200).json({message : "Problem deleted successfully", problem})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message : "Internal server Error"})
    }
}