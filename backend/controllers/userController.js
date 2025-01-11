const { default: mongoose } = require("mongoose");

const User = require("../models/userModel.js");
const catchAsync = require("../utils/catchAsync.js");
const AppError = require("../utils/appError.js");
const { Categories } = require("../models/categoryModel.js");
const { Accounts } = require("../models/accountModel.js");
const { Budgets } = require("../models/budgetModel.js");
const { Transactions } = require("../models/transactionModel.js");
const { createDefaultData } = require("../utils/defaultData.js");

// Filter Body
const filterObj = (obj, ...allowedFields) => {
  let newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.getall = catchAsync(async (req, res, next) => {
  const users = await User.find();

  if (users.length == 0) {
    return next(new AppError("No data fount", 404));
  }
  res.status(200).json({
    status: "success",
    data: users,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    "username",
    "profile",
    "currency",
    "chart"
  );
  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    user,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  let session = await mongoose.startSession();
  try {
    session.startTransaction();
    const userId = req.user._id;
    await Categories.deleteMany({ userId }, { session });
    await Accounts.deleteMany({ userId }, { session });
    await Budgets.deleteMany({ userId }, { session });
    await Transactions.deleteMany({ userId }, { session });
    await User.deleteOne({ _id: userId }, { session });
    await session.commitTransaction();
    res.cookie("jwt", "", {
      expires: new Date(Date.now() + 5 * 1000),
      HttpOnly: true,
    });
    return res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    session.abortTransaction();
    return res.status(500).json({
      status: "fail",
      data: error.message,
    });
  } finally {
    session.endSession();
  }
});

exports.getUser = catchAsync(async (req, res) => {
  let user = await User.findById(req.user._id);
  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.resetApp = catchAsync(async (req, res) => {
  let session = await mongoose.startSession();
  try {
    session.startTransaction();
    const userId = req.user._id;
    await Categories.deleteMany({ userId }, { session });
    await Accounts.deleteMany({ userId }, { session });
    await Budgets.deleteMany({ userId }, { session });
    await Transactions.deleteMany({ userId }, { session });

    await session.commitTransaction();
    await createDefaultData(userId);
    return res.status(200).json({
      status: "success",
    });
  } catch (error) {
    session.abortTransaction();
    return res.status(500).json({
      status: "fail",
      data: error.message,
    });
  } finally {
    session.endSession();
  }
});
exports.userCount = catchAsync(async (req, res) => {
  let count = await User.countDocuments({});
  res.status(200).json({
    status: "success",
    userCount: count,
  });
});
