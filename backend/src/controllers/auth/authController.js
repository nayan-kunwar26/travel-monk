import User from "../../models/user/user.js";
import { asyncHandler } from "../../utils/errors/asyncHandler.js";
import ErrorResponse from "../../utils/errors/errorResponse.js";
import { generateSignUpToken } from "../../utils/generateSignUpToken.js";
import { sendMail } from "../../utils/Mail/sendMail.js";
import bcrypt from "bcrypt";
import { COOKIE_OPTIONS } from "../../../constants.js";

//SignUp controller
export const signUp = asyncHandler(async (req, res, next) => {
  const { email, password } = req?.body;

  if (!email | !password) {
    return next(new ErrorResponse("All fields are required", 400));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new ErrorResponse("User already exists!", 400));

  const signUpToken = generateSignUpToken({ email, password });
  const verificationUrl = `http://localhost:5000/api/v1/mail/verifySignupToken/${signUpToken}`;

  sendMail(email, verificationUrl)
    .then(() => {
      return res.status(200).json({
        success: true,
        message:
          "Mail sent successfully. Please check your email, including the spam or junk folder and follow the instructions to verify your email address and finish setting up your account.",
      });
    })
    .catch((error) => {
      res.status(400).json({
        success: false,
        message: `Unable to send mail! ${error.message}`,
      });
    });
});

// Login controller
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req?.body;
  const existingUser = await User.findOne({ email });

  if (!existingUser) return next(new ErrorResponse("No user found!!", 400));

  const isValidPassword = existingUser.isPasswordCorrect(password);

  if (!isValidPassword) return next(new ErrorResponse("Wrong password!!", 400));

  const refresh_token = existingUser.generateRefreshToken();
  const access_token = existingUser.generateAccessToken();

  res
    .cookie("access_token", refresh_token, COOKIE_OPTIONS)
    .cookie("refresh_token", access_token, COOKIE_OPTIONS)
    .status(200)
    .json({ success: true, message: "Logged in successfully." });
});

//Logout controller
export const logout = asyncHandler((req, res, next) => {
  res
    .cookie("access-token", "", { maxAge: 0 })
    .cookie("refresh-token", "", { maxAge: 0 })
    .status(200)
    .json({ success: true, message: "Logout successfully!!" });
});
