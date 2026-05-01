import Discussion from "../models/Discussion.js";
import Problem from "../models/Problem.js";
import Solution from "../models/Solution.js";

export const createDiscussion = async (req, res) => {
    try {
        const { problemId } = req.params;
        const { message, solutionId } = req.body;

        if (!message) {
            return res.status(400).json({ message: "Discussion message is required" });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem Not Found" });
        }

        let linkedSolutionId = null;
        if (solutionId) {
            const solution = await Solution.findById(solutionId);
            if (!solution || solution.problemId.toString() !== problemId.toString()) {
                return res.status(400).json({ message: "Invalid solution for this problem" });
            }
            linkedSolutionId = solutionId;
        }

        const discussion = await Discussion.create({
            problemId,
            user: req.user.id,
            message,
            solutionId: linkedSolutionId
        });

        await discussion.populate("user", "name email");

        return res.status(201).json({ message: "Discussion added successfully", discussion });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};

export const getDiscussionsByProblemId = async (req, res) => {
    try {
        const { problemId } = req.params;

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem Not Found" });
        }

        const discussions = await Discussion.find({ problemId })
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({ message: "Discussions found successfully", discussions });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};

export const updateDiscussion = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: "Discussion message is required" });
        }

        const discussion = await Discussion.findById(id);
        if (!discussion) {
            return res.status(404).json({ message: "Discussion not found" });
        }

        if (discussion.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        discussion.message = message;
        await discussion.save();
        await discussion.populate("user", "name email");

        return res.status(200).json({ message: "Discussion updated successfully", discussion });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};

export const deleteDiscussion = async (req, res) => {
    try {
        const { id } = req.params;

        const discussion = await Discussion.findById(id);
        if (!discussion) {
            return res.status(404).json({ message: "Discussion not found" });
        }

        if (discussion.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await discussion.deleteOne();

        return res.status(200).json({ message: "Discussion deleted successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};