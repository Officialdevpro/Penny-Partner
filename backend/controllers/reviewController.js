const catchAsync = require("../utils/catchAsync.js");
const AppError = require("../utils/appError.js");
const Reviews = require("../models/reviewModel.js");

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Reviews.find();
  const stats = await Reviews.calcAverageRatings();
  res.status(200).json({
    status: "success",
    restult: reviews.length,
    reviews,
    stats,
  });
});

exports.createReviews = catchAsync(async (req, res, next) => {
  let data = req.body;
  data.user = req.user._id;
  const newReview = await Reviews.create(data);

  res.status(201).json({
    status: "success",
    review: newReview,
  });
});

exports.updateReviews = catchAsync(async (req, res, next) => {
  let data = req.body;
  let a = await Reviews.findOne({ _id: req.params.id, user: req.user._id });
  const updatedReview = await Reviews.findOneAndUpdate(
    { _id: req.params.id },
    data,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    review: updatedReview,
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  await Reviews.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: "success",
  });
});
