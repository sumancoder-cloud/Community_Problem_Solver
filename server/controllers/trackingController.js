import Problem from "../models/Problem.js";
import Tracking from "../models/Tracking.js";

export const getTrackingByProblemId = async (req, res) => {
    try {
        const { problemId } = req.params;

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem Not Found" });
        }

        const tracking = await Tracking.find({ problemId })
            .populate("updatedBy", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({ message: "Tracking history found successfully", tracking });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};

export const createTrackingNote = async (req, res) => {
    try {
        const { problemId } = req.params;
        const { note } = req.body;

        if (!note || !note.trim()) {
            return res.status(400).json({ message: "Tracking note is required" });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem Not Found" });
        }

        if (problem.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const tracking = await Tracking.create({
            problemId: problem._id,
            status: problem.status,
            note: note.trim(),
            updatedBy: req.user.id
        });

        await tracking.populate("updatedBy", "name email");

        return res.status(201).json({ message: "Tracking note added", tracking });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};