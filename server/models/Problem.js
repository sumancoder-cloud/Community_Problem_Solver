import mongoose from 'mongoose'

const problemSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    description : {
        type : String, 
        required : true 
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    image : {
        type : String
    },
    location : {
        type : String,
        required : true
    },
    city: {
        type: String,
        required: true
    },
    status : {
        type : String,
        enum : ["open", "in-progress", "completed"],
        default : "open"
    },
    selectedSolutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Solution",
        default: null
    },
    completionRequested: {
        type: Boolean,
        default: false
    }
}, {timestamps : true})

const Problem = mongoose.model('Problem', problemSchema)

export default Problem;