import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        required: true
    },
    solutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Solution",
        default: null
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

const Discussion = mongoose.model('Discussion', discussionSchema);

export default Discussion;