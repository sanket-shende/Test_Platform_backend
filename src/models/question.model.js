import mongoose, { Schema } from "mongoose";

const questionSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    mark: {
        type: Number,
        required: true,
        min: 0
    },
    option: {
        type: Array,
        required: true,
        max: 4
    },
    answer: {
        type: String,
        required: true,
    }
})

export const Question = mongoose.model("Question", questionSchema)