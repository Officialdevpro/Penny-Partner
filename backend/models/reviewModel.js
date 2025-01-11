// review // rating // createdAt // ref to user //
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can not be empty!"],
    },
    rating: {
      type: Number,
      required: true,
      max: 5,
      min: 1,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "username",
  });
  next();
});

// This is not a middleware, this is a statics method
reviewSchema.statics.calcAverageRatings = async function () {
  const overallStats = await this.aggregate([
    {
      $group: {
        _id: null,
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  let overallResult;
  if (overallStats.length > 0) {
    overallResult = {
      nRating: overallStats[0].nRating,
      avgRating: Math.round(overallStats[0].avgRating * 10) / 10,
    };
  } else {
    overallResult = {
      nRating: 0,
      avgRating: 0,
    };
  }

  const ratingStats = await this.aggregate([
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const totalRatings = overallResult.nRating;
  const percentages = {};
  if (totalRatings > 0) {
    ratingStats.forEach(stat => {
      percentages[stat._id] = ((stat.count / totalRatings) * 100).toFixed(2);
    });
  }

  return {
    ...overallResult,
    percentages, // E.g., { 1: "20.00", 2: "13.33", 3: "6.67", 4: "26.67", 5: "33.33" }
  };
};


// reviewSchema.index({ user: 1 }, { unique: true });

// reviewSchema.post("save", function () {
//   //here no need to call the next middle were because of post hook
//   this.constructor.calcAverageRatings();
// });

const Reviews = mongoose.model("Reviews", reviewSchema);
module.exports = Reviews;
