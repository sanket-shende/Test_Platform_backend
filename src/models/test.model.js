import mongoose, { Schema } from "mongoose";

const testSchema = new Schema(
	{
		title: {
			type: String,
			required: [true, "Title is required"],
			trime: true,
		},
		description: {
			type: String,
			required: [true, "Title is required"],
			trime: true,
		},
		validity: {
			type: Number,
			min: 0,
		},
		status: {
			type: String,
			enum: ["public", "private"],
		},
		paid: {
			type: String,
			enum: ["yes", "no"],
		},
		price: {
			type: Number,
			min: 0,
		},
		subTest: {
			type: Schema.Types.ObjectId,
			ref: "SubTest",
		},
	},
	{
		timestamps: true,
	}
);

export const Test = mongoose.model("Test", testSchema);
