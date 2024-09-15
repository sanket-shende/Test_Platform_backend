import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefereshTokens = async (userId) => {
	try {
		const user = await User.findById(userId);
		const accessToken = user.generateAccessToken();
		const refreshToken = user.generateRefreshToken();

		user.refreshToken = refreshToken;
		await user.save({ validateBeforeSave: false });

		return { accessToken, refreshToken };
	} catch (error) {
		console.log(error);

		throw new ApiError(
			500,
			"Something went wrong while generating referesh and access token"
		);
	}
};

export const registerUser = asyncHandler(async (req, res) => {
	const { username, email, password } = req.body;

	if (!(username && email && password)) {
		throw new ApiError(400, "All fields are required");
	}

	if (!email.includes("@")) {
		throw new ApiError(400, "Valid email required");
	}

	const existedUser = await User.findOne({
		$or: [{ username }, { email }],
	});

	if (existedUser) {
		throw new ApiError(409, "User with email or username already exists");
	}

	const user = await User.create({
		username,
		email,
		password,
	});

	const createdUser = await User.findById(user._id).select(
		"-password -refreshToken"
	);

	if (!createdUser) {
		throw new ApiError(
			500,
			"Something went wrong while registering the user"
		);
	}

	return res
		.status(201)
		.json(new ApiResponse(200, createdUser, "user created successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
	const { username, email, password } = req.body;

	if (!((username || email) && password)) {
		throw new ApiError(400, "All fields are required");
	}

	const user = await User.findOne({
		$or: [{ username }, { email }],
	});

	if (!user) {
		throw new ApiError(404, "User does not exist");
	}

	const isPasswordValid = await user.isPasswordCorrect(password);

	if (!isPasswordValid) {
		throw new ApiError(404, "Password is incorrect");
	}

	const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
		user._id
	);

	const loggedInUser = await User.findById(user._id).select(
		"-password -refreshToken"
	);

	const options = {
		httpOnly: true,
		secure: true,
	};

	return res
		.status(200)
		.cookie("accessToken", accessToken, options)
		.cookie("refreshToken", refreshToken, options)
		.json(
			new ApiResponse(
				200,
				{
					user: loggedInUser,
					accessToken,
					refreshToken,
				},
				"User logged in Successfully"
			)

		);

        

        
        
});

export const logoutUser = asyncHandler(async (req, res) => {
	await User.findByIdAndUpdate(
        req.user?._id,
		{
			$set: {
				refreshToken: 1,
			},
		},
		{
			new: true,
		}
	);
    
	const options = {
		httpOnly: true,
		secure: true,
	};

	return res
		.status(200)
		.clearCookie("accessToken", options)
		.clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});
