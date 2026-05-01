import Problem from "../models/Problem.js";
import User from "../models/User.js";
import Solution from "../models/Solution.js";
import Tracking from "../models/Tracking.js";

const CITY_LIST = [
    "Andhra Pradesh",
    "Bihar",
    "Delhi",
    "Gujarat",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Rajasthan",
    "Uttar Pradesh"
];

const buildStats = (problems = []) => {
    const total = problems.length;
    const open = problems.filter((p) => p.status === "open").length;
    const inProgress = problems.filter((p) => p.status === "in-progress").length;
    const completed = problems.filter((p) => p.status === "completed").length;
    const completionRequested = problems.filter((p) => p.completionRequested).length;

    const completedProblems = problems.filter((p) => p.status === "completed");
    const avgResolutionDays = completedProblems.length
        ? Number((completedProblems.reduce((sum, p) => {
            const ms = new Date(p.updatedAt).getTime() - new Date(p.createdAt).getTime();
            return sum + ms;
        }, 0) / completedProblems.length / (1000 * 60 * 60 * 24)).toFixed(2))
        : 0;

    return {
        total,
        open,
        inProgress,
        completed,
        completionRequested,
        avgResolutionDays
    };
};

export const getRegionAnalytics = async (req, res) => {
    try {
        const city = req.params.city;
        if (!city) {
            return res.status(400).json({ message: "City is required" });
        }

        const problems = await Problem.find({ city });
        const stats = buildStats(problems);

        return res.status(200).json({ message: "Region analytics", city, stats });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};

export const getRegionsAnalytics = async (req, res) => {
    try {
        const results = await Promise.all(
            CITY_LIST.map(async (city) => {
                const problems = await Problem.find({ city });
                return {
                    city,
                    stats: buildStats(problems)
                };
            })
        );

        return res.status(200).json({ message: "Regions analytics", regions: results });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};

export const getVolunteerDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("role city");
        if (!user || user.role !== "volunteer") {
            return res.status(403).json({ message: "Volunteer access only" });
        }

        if (!user.city) {
            return res.status(400).json({ message: "Volunteer city is not set" });
        }

        const problems = await Problem.find({ city: user.city });
        const stats = buildStats(problems);
        const completionRequests = problems
            .filter((p) => p.completionRequested)
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        return res.status(200).json({
            message: "Volunteer dashboard",
            city: user.city,
            stats,
            completionRequests
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};

export const getAdminDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("role");
        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Admin access only" });
        }

        const problems = await Problem.find();
        const stats = buildStats(problems);
        const completionRate = stats.total ? Number(((stats.completed / stats.total) * 100).toFixed(2)) : 0;

        const totalVotesAgg = await Solution.aggregate([
            { $group: { _id: null, totalVotes: { $sum: "$votes" } } }
        ]);
        const totalVotes = totalVotesAgg[0]?.totalVotes || 0;

        const topProblemVotes = await Solution.aggregate([
            { $group: { _id: "$problemId", votes: { $sum: "$votes" } } },
            { $sort: { votes: -1 } },
            { $limit: 5 }
        ]);

        const topProblemIds = topProblemVotes.map((item) => item._id);
        const topProblemsRaw = await Problem.find({ _id: { $in: topProblemIds } }).select("title city status");
        const topProblems = topProblemVotes.map((item) => {
            const problem = topProblemsRaw.find((p) => String(p._id) === String(item._id));
            return {
                problemId: String(item._id),
                title: problem?.title || "Unknown",
                city: problem?.city || "",
                status: problem?.status || "",
                votes: item.votes
            };
        });

        const topVolunteerAgg = await Tracking.aggregate([
            { $match: { status: "completed" } },
            { $group: { _id: "$updatedBy", completedCount: { $sum: 1 } } },
            { $sort: { completedCount: -1 } },
            { $limit: 5 }
        ]);

        const volunteerIds = topVolunteerAgg.map((item) => item._id);
        const volunteerUsers = await User.find({ _id: { $in: volunteerIds } }).select("name email city role");
        const topVolunteers = topVolunteerAgg
            .map((item) => {
                const volunteer = volunteerUsers.find((v) => String(v._id) === String(item._id));
                if (volunteer?.role !== "volunteer") {
                    return null;
                }
                return {
                    userId: String(item._id),
                    name: volunteer?.name || "Unknown",
                    email: volunteer?.email || "",
                    city: volunteer?.city || "",
                    role: volunteer?.role || "",
                    completedCount: item.completedCount
                };
            })
            .filter(Boolean);

        return res.status(200).json({
            message: "Admin dashboard analytics",
            stats: {
                ...stats,
                completionRate,
                totalVotes
            },
            topProblems,
            topVolunteers
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};

export { CITY_LIST };
