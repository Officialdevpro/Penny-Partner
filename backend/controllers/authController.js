const { default: mongoose } = require("mongoose");
const User = require("../models/userModel.js");
const catchAsync = require("../utils/catchAsync.js");
const AppError = require("../utils/appError.js");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { createDefaultData } = require("../utils/defaultData.js");
const { promisify } = require("util");
const sendEmail = require("../utils/email.js");
const path = require("path");
const TempUsers = require("../models/tempModel.js");

// Function to generate JWT
const signToken = (id) => {
  try {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "2d" });
  } catch (e) {
    throw new Error("Token generation failed");
  }
};

// Function to create and send token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: true,
    httpOnly: true,
  };
  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    status: "success",
    user,
    token,
  });
};

// Middleware to check if ID exists
const checkId = catchAsync(async (req, res, next, val) => {
  const isValidId = await User.findById(val);
  if (isValidId) {
    next();
  } else {
    return res.status(404).json({
      status: "failed",
      message: "User not found",
    });
  }
});

// SIGNUP Controller
const signup = catchAsync(async (req, res, next) => {
  const tempUser = await TempUsers.findOne({ email: req.body.email });
  if (!tempUser) {
    return next(new AppError("Something went wrong.", 400));
  }
  if (tempUser.otpExpires < Date.now()) {
    return next(new AppError("Your OTP has expired.", 400));
  }
  if (tempUser.otp !== req.body.otp) {
    return next(new AppError("OTP you entered is invalid", 400));
  }
  const newUser = await User.create({
    username: tempUser.username,
    email: tempUser.email,
    password: tempUser.password,
  });

  createSendToken(newUser, 201, res);
  await createDefaultData(newUser._id);
  await TempUsers.findByIdAndDelete(tempUser._id);
});

// LOGIN Controller
const logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email & password", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  createSendToken(user, 200, res);
});

// LOGOUT Controller
const logOut = (req, res) => {
  res.cookie("jwt", "", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
    message: "You are logged out!",
  });
};

// Protect Route Middleware
const product = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return res.sendFile(path.join(__dirname, "..", "views", "auth.html"));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return res.sendFile(path.join(__dirname, "..", "views", "auth.html"));
  }
  if (freshUser.changePasswordAfter(decoded.iat)) {
    return res.sendFile(path.join(__dirname, "..", "views", "auth.html"));
  }
 
  req.user = freshUser;
  next();
});

// FORGOT PASSWORD
const forgotPassword = async (req, res, next) => {
  // 1) Get user based on posted email

  let user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError("There is no user wiht email address", 404));

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); //DONT FORGET TO SAVE THE USER otherwhis it wont sava

  // 3) Send it to user's email
  const resetURL = `https:://pp-qln0.onrender.com/api/v1/users/resetPassword/${resetToken}`;

  const message = `
  <p>Forgot your password? Click the link below to reset it:</p>
  <p><a href="${resetURL}">${resetURL}</a></p>
  <p>If you didn't forget your password, please ignore this email!</p>
`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Reset link sent! Check your email.",
    });
  } catch (e) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
};

const resetPassword = catchAsync(async (req, res, next) => {
  // 1 ) Get user based on token

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) return next(new AppError("Token is invalid or has expired", 400));
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: true });

  // 3) Update changedPasswordAt property for the user;
  // look the model pre hook

  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // POINTS TO THINK------------------------------------------------------
  /*Here dont user findbyIdAndUpdate its so danger because all the mongoose validatator will work only on sava and create 
  not update that why dont user this and also pre save middlewares also not working
  User.findbyIdAndUpdate will not work as INDEEDed */

  // 2) Check if POSTED current password is correct
  if (!(await user.correctPassword(req.body.password, user.password))) {
    return next(new AppError("Your current password is wrong", 401));
  }

  // 3) If so, update password
  user.password = req.body.newPassword;
  await user.save();

  // 4) Log user in,sent JWT
  createSendToken(user, 200, res);
});

const tempUser = catchAsync(async (req, res, next) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return next(new AppError("Email already in use.", 400));
  }
  // 1 >> Generate the OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpirationTime = Date.now() + 5 * 60 * 1000;

  const { username, email, password } = req.body;

  const message = `
  <h2>Dear ${username},</h2>

<p>Thank you for using <strong>Penny Partner</strong>!</p>

<p>Your One-Time Password (OTP) for verification is:</p>
<div style="text-align: center;">
    <h1 style="font-size: 36px; color: #000;">${otp}</h1>
</div>

<p>Please enter this OTP in <strong>Penny Partner</strong> to complete your verification process.</p>

<p>If you did not request this verification, please ignore this email.</p>

<p>Thank you!</p>

<h3>Best regards,</h3>
<p>Penny Partner</p>
`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: "OTP Verification Code (valid for 5 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "OTP sent to your email",
    });

    let isExit = await TempUsers.findOne({ email });

    if (!isExit) {
      await TempUsers.create({
        username,
        email,
        password,
        otp,
        otpExpires: otpExpirationTime,
      });
    } else {
      isExit.password = password;
      isExit.username = username;
      isExit.otp = otp;
      isExit.otpExpires = otpExpirationTime;
      await isExit.save();
    }
  } catch (e) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});

const sendForgotPage = catchAsync(async (req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "views", "resetPassword.html"));
});

module.exports = {
  product,
  signup,
  logIn,
  logOut,
  resetPassword,
  updatePassword,
  tempUser,
  forgotPassword,
  createSendToken,
  signToken,
  sendForgotPage,
};
