import mongoose from "mongoose";

const trackingSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        required: true
    },
    status: {
        type: String,
        enum: ["open", "in-progress", "completed"],
        required: true
    },
    note: {
        type: String,
        trim: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

const Tracking = mongoose.model('Tracking', trackingSchema);

export default Tracking;