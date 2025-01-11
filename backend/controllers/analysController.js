const { Transactions } = require("../models/transactionModel");
const catchAsync = require("../utils/catchAsync");

exports.visualizeData = catchAsync(async (req, res, next) => {
  // Get the requested type (either 'income' or 'expense') from the query parameter
  const type = req.query.type;
  const month = req.query.month;

  // Ensure a valid type is provided, defaulting to 'income' if none is specified
  if (!type || (type !== "income" && type !== "expense")) {
    return res
      .status(400)
      .json({ message: "Invalid type. Please provide 'income' or 'expense'." });
  }

  let transactions = await Transactions.aggregate([
    {
      $match: {
        userId: req.user._id,
        month, // Match only November 2024 transactions
      },
    },
    {
      $group: {
        _id: "$category", // Group by category
        totalAmount: { $sum: "$amount" }, // Sum the amount for each category
      },
    },
    {
      $lookup: {
        from: "categories", // Join with the categories collection
        localField: "_id", // Match category ID
        foreignField: "_id",
        as: "categoryDetails", // Output will be an array of category details
      },
    },
    {
      $unwind: "$categoryDetails", // Flatten the categoryDetails array
    },
    {
      $project: {
        _id: 0,
        category: {
          _id: "$categoryDetails._id",
          name: "$categoryDetails.name",
          type: "$categoryDetails.type",
          image: "$categoryDetails.image",
        },
        totalAmount: 1, // Include totalAmount field
      },
    },
    {
      $sort: {
        totalAmount: -1, // Sort by totalAmount in descending order
      },
    },
  ]);

  // Filter transactions based on the requested type (income or expense)
  const filteredTransactions = transactions.filter(
    (transaction) => transaction.category.type === type
  );

  // Calculate the total for the requested type (income or expense)
  const totalIncome = filteredTransactions.reduce(
    (sum, transaction) => sum + transaction.totalAmount,
    0
  );

  // Send response with filtered transactions and the total amount
  res.status(200).json({
    transactions: filteredTransactions,
    totalIncome,
    chart: req.user.chart,
  });
});
