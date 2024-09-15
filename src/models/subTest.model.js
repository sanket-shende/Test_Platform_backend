import mongoose, { Schema } from "mongoose";

const subTestSchema = new Schema(
	{
		testType: {
			type: String,
			enum: ["MCQ", "FITB"],

			required: true,
		},
		totalMark: {
			type: Number,
			required: true,
		},
		question: [
            {
			    type: Schema.Types.ObjectId,
			    ref: "Question",
		    },
        ],
	},
	{
		timestamps: true,
	}
);

export const SubTest = mongoose.model("SubTest", subTestSchema);
