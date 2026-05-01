import Solution from "../models/Solution.js";
import Vote from "../models/Vote.js";
import Problem from "../models/Problem.js";
import { createNotification } from "../utils/notifications.js";

export const voteSolution = async (req, res) => {
    try {
        const solutionId = req.params.solutionId;
        const userId = req.user.id;
        const solution = await Solution.findById(solutionId);
        if(!solution) {
            return res.status(404).json({message : "Solution not found"})
        }
        const alreadyVoted = await Vote.findOne({userId, solutionId})
        if(alreadyVoted) {
            return res.status(400).json({message : "You have already voted for this solution"})
        }
        const vote = new Vote({userId, solutionId})
        await vote.save()
        const updatedSolution = await Solution.findByIdAndUpdate(solutionId, {
            $inc: { votes: 1 }
        }, { new: true });

        const problem = await Problem.findById(solution.problemId);
        if (problem && solution.user.toString() !== userId.toString()) {
            await createNotification({
                userId: solution.user,
                title: "Your solution received a vote",
                message: `Your solution for ${problem.title} received a new vote.`,
                type: "vote",
                link: `/problems/${problem._id}`,
                emailSubject: "Your solution got a vote",
                emailText: `A user voted for your solution on problem: ${problem.title}`
            });
        }

        res.status(200).json({message : "Vote added successfully"})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message : "Internal server Error"})
    }
}

export const removeVote = async (req, res) => {
    try {
        const solutionId = req.params.solutionId;
        const userId = req.user.id;
        const solution = await Solution.findById(solutionId);
        if(!solution) {
            return res.status(404).json({message : "Solution not found"})
        }
        const existingVote = await Vote.findOne({userId, solutionId})
        if(!existingVote) {
            return res.status(400).json({message : "You have not voted for this solution"})
        }
        await existingVote.deleteOne()
        await Solution.findByIdAndUpdate(solutionId, {
            $inc: { votes: -1 }
        });
        res.status(200).json({message : "Vote removed successfully"})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message : "Internal server Error"})
    }
}