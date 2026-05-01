import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true 
    },
    solutionId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Solution",
        required : true
    }
}, {timestamps : true})

voteSchema.index({ userId: 1, solutionId: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);

export default Vote;