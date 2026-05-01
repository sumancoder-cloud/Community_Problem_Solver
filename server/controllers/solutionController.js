import Solution from '../models/Solution.js';
import Problem from '../models/Problem.js'
import { createNotification } from '../utils/notifications.js';

export const createSolution = async (req, res) => {
    try {
        const problemId = req.params.problemId;
        const problem = await Problem.findById(problemId)
        if(!problem) {
            return res.status(404).json({message : "Problem Not Found"})
        }
        const {description} = req.body;
        if(!description) {
            return res.status(400).json({message : "Solution description is required"})
        }
        const solution = new Solution({problemId, user :  req.user.id, description})
        await solution.save()

        if (problem.user.toString() !== req.user.id.toString()) {
            await createNotification({
                userId: problem.user,
                title: "New solution added",
                message: `A new solution was added to your problem: ${problem.title}`,
                type: "solution",
                link: `/problems/${problemId}`,
                emailSubject: "New solution on your problem",
                emailText: `Someone added a new solution to your problem titled: ${problem.title}`
            });
        }

        res.status(201).json({message : "Your Solution was Added", solution})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message : "Internal server Error"})
    }
}

export const getSolutionsByProblemId = async (req, res) => {
    try {
        const problemId = req.params.problemId;
        const problem = await Problem.findById(problemId)
        if(!problem) {
            return res.status(404).json({message : "Problem Not Found"})
        }
        const solutions = await Solution.find({problemId})
            .populate("user", "name email")
            .sort({ votes: -1, createdAt: 1 });

        const bestSolutionId = solutions.length > 0 ? solutions[0]._id.toString() : null;
        const rankedSolutions = solutions.map((solution, index) => ({
            ...solution.toObject(),
            rank: index + 1,
            isBestSolution: solution._id.toString() === bestSolutionId
        }));

        res.status(200).json({
            message : "Solutions Found Successfully",
            bestSolutionId,
            bestSolution: rankedSolutions[0] || null,
            solutions: rankedSolutions
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({message : "Internal server Error"})
    }
}

export const getMySolutions = async (req, res) => {
  try {
    const solutions = await Solution.find({ user: req.user.id });

    res.json({ solutions });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user solutions" });
  }
};

export const updateSolution = async (req, res) => {
    try {
        const id = req.params.id;
        const solution = await Solution.findById(id);
        if(!solution) {
            return res.status(404).json({message : "Solution not found"})
        }
        const {description} = req.body 
        if(!description) {
            return res.status(400).json({message : "solution description is required"})
        }
        if(solution.user.toString() != req.user.id.toString()) {
            return res.status(403).json({message : "Unauthorized"})
        }
        solution.description = description
        await solution.save()
        res.status(200).json({message : "Solution updated", solution})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message : "Internal server Error"})
    }
}

export const deleteSolution = async (req, res) => {
    try {
        const id = req.params.id
        const solution = await Solution.findById(id);
        if(!solution) {
            return res.status(404).json({message : "Solution not found"})
        }
        if(solution.user.toString() != req.user.id.toString()) {
            return res.status(403).json({message : "Unauthorized"})
        }
        await solution.deleteOne()
        res.status(200).json({message : "Solution deleted"})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message : "Internal server Error"})
    }
}