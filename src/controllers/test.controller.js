import { Test } from "../models/test.model.js";

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Question } from "../models/question.model.js";
import { SubTest } from "../models/subTest.model.js";

export const createTest = asyncHandler(async (req, res) => {
	const { title, description, validity, status, paid, price } = req.body;

	if (!(title && description && validity && status && paid)) {
		throw new ApiError(400, "All fields are required");
	}

	if (paid == "yes") {
		if (!price) {
			throw new ApiError(400, "All fields are required");
		}
	}

	const createdTest = await Test.create({
		title,
		description,
		validity,
		status,
		paid,
		price,
	});

	return res
		.status(201)
		.json(new ApiResponse(200, createdTest, "Test created successfully"));
});

export const createSubTest = asyncHandler(async (req, res) => {
	const { questions, queType, mark, testId } = req.body;

	questions.map((obj, index) => {
		if (
			!(
				obj &&
				obj.que &&
				obj.opt.length > 0 &&
				obj.mark &&
				obj.ans &&
				queType &&
				mark
			)
		) {
			throw new ApiError(400, "All fields are required");
		}
	});

	const subTest = await SubTest.create({
		testType: queType,
		totalMark: mark,
	});

	// Create Questions and collect their IDs
	const createQuestionPromises = questions.map(async (obj) => {
		const question = await Question.create({
			question: obj.que,
			mark: obj.mark,
			option: obj.opt,
			answer: obj.ans,
		});
		return question._id; // Return the ID of the created question
	});

	const questionIds = await Promise.all(createQuestionPromises);

	// Push all question IDs to SubTest and save it
	subTest.question.push(...questionIds);
	await subTest.save();

	const test = await Test.findById(testId);
	test.subTest = subTest._id;
	await test.save();

	const options = {
		httpOnly: true,
		secure: true,
	};

	return res
		.status(201)
		.json(new ApiResponse(200, "Questions created successfully"));
});

export const getAllTest = asyncHandler(async (req, res) => {
	const allTest = await Test.find({});

	return res
		.status(201)
		.json(new ApiResponse(200, allTest, "All test fetch successfully"));
});

export const checkTest = asyncHandler(async (req, res) => {
    const {answers, id} = req.body

    if (!answers) {
        throw new ApiError(400, "answer is required");
    }

		// Fetch the test by ID
		const test = await Test.findById(id);
		if (!test) {
			return res
				.status(404)
				.json(new ApiResponse(404, "Test not found"));
		}

		// Fetch the associated sub-test
		const subTest = await SubTest.findById(test.subTest);
		if (!subTest) {
			return res
				.status(404)
				.json(new ApiResponse(404, "SubTest not found"));
		}

		// Fetch all questions associated with the sub-test
		const questions = await Question.find({
			_id: { $in: subTest.question },
		});
        

        // console.log(questions);
        questions.map((q,qindex)=>{
            // console.log(q.answer);
            // console.log(answers[qindex]);
            
            if (answers[qindex] == q.answer) {
                console.log(`que ${qindex + 1} is right`);
                
            }
        
        })
  
    
	return res
		.status(201)
		.json(new ApiResponse(200, "Test check Successfully"));
});

export const showTest = asyncHandler(async (req, res) => {
	const { id } = req.params;

    try {
        const test = await Test.findById(id);
        if (!test) {
            throw new ApiError(400, "Test not 22 Found")
        }
        return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				test,
				"Test fetched successfully"
			)
		);
    } catch (error) {
        throw new ApiError(400, "Test not Found")
    }


	
});

export const solveTest = asyncHandler(async (req, res) => {
	const { id } = req.params;

	try {
		// Fetch the test by ID
		const test = await Test.findById(id);
		if (!test) {
			return res
				.status(404)
				.json(new ApiResponse(404, "Test not found"));
		}

		// Fetch the associated sub-test
		const subTest = await SubTest.findById(test.subTest);
		if (!subTest) {
			return res
				.status(404)
				.json(new ApiResponse(404, "SubTest not found"));
		}

		// Fetch all questions associated with the sub-test
		const questions = await Question.find({
			_id: { $in: subTest.question },
		});

		return res
			.status(200)
			.json(
				new ApiResponse(
					200,
					{ test, subTest, questions },
					"Test fetched successfully"
				)
			);
	} catch (error) {
		return res.status(500).json(new ApiResponse(500, null, "Server error"));
	}
});
