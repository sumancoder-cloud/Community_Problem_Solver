import mongoose from "mongoose";

const solutionSchema = new mongoose.Schema({
    problemId :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Problem",
        required : true
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    description : {
        type : String,
        required : true
    },
    votes : {
        type : Number,
        default : 0
    }
}, {timestamps : true})

const Solution = mongoose.model('Solution', solutionSchema);

export default Solution;