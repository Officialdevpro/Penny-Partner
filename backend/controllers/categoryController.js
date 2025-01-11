const { Categories } = require("../models/categoryModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const { Accounts } = require("../models/accountModel");
const { Transactions } = require("../models/transactionModel");
const { Budgets } = require("../models/budgetModel");

exports.getAllCategories = catchAsync(async (req, res, next) => {
  let categories = await Categories.find({ userId: req.user._id });

  if (!categories) {
    return next(new AppError("Categories not found", 404));
  }

  res.status(200).json({
    status: "success",
    result: categories.length,
    data: categories,
  });
});

exports.createCategory = catchAsync(async (req, res, next) => {
  let newCategory = await Categories.create({
    image: req.body.image,
    name: req.body.name,
    type: req.body.type,
    userId: req.user._id,
  });

  // Respond with the newly created category
  res.status(201).json({
    status: "success",
    data: newCategory,
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await Categories.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: category,
  });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  let userId  = req.user._id;
  let categoryId = req.params.id;

  await Transactions.deleteMany({
    userId,
    category: categoryId,
  });

  await Budgets.deleteMany({ userId, categoryId });
  await Categories.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: "success",
  });
});

//for income expense and account
exports.getAccountsAndCategories = catchAsync(async (req, res, next) => {
  // Fetch categories and group them into income and expense
  let categories = await Categories.find({ userId: req.user._id });
  if (!categories) {
    return next(new AppError("Categories not found", 404));
  }

  const categorized = categories.reduce(
    (acc, item) => {
      if (item.type === "income") acc.income.push(item);
      if (item.type === "expense") acc.expense.push(item);
      return acc;
    },
    { income: [], expense: [] }
  );

  // Aggregate accounts and calculate balances
  let userAccounts = await Accounts.aggregate([
    { $match: { userId: req.user._id } }, // Match user's accounts
    {
      $lookup: {
        from: "transactions", // Join with transactions collection
        localField: "_id",    // Account ID in Accounts
        foreignField: "account", // Account ID in Transactions
        as: "transactions",  // Output field
      },
    },
    {
      $addFields: {
        totalIncome: {
          $sum: {
            $map: {
              input: "$transactions",
              as: "transaction",
              in: {
                $cond: [
                  { $eq: ["$$transaction.type", "income"] }, // Check if income
                  "$$transaction.amount", // Add income amount
                  0, // Otherwise, add 0
                ],
              },
            },
          },
        },
        totalExpense: {
          $sum: {
            $map: {
              input: "$transactions",
              as: "transaction",
              in: {
                $cond: [
                  { $eq: ["$$transaction.type", "expense"] }, // Check if expense
                  "$$transaction.amount", // Add expense amount
                  0, // Otherwise, add 0
                ],
              },
            },
          },
        },
      },
    },
    {
      $addFields: {
        balance: {
          $add: [
            "$balance", // Initial balance
            { $subtract: ["$totalIncome", "$totalExpense"] }, // Net balance
          ],
        },
      },
    },
    {
      $project: {
        accountName: 1,
        accountImage: "$icon", // Rename icon to accountImage
        initialBalance: "$balance", // Original balance
        totalIncome: 1,
        totalExpense: 1,
        balance: 1, // Calculated final balance
      },
    },
  ]);

  // Send the combined response
  res.status(200).json({
    status: "success",
    incomeCategories: categorized.income,
    expenseCategories: categorized.expense,
    accounts: userAccounts, // Accounts with calculated balances
  });
});


exports.homeUpdate = catchAsync(async (req, res, next) => {
  const { categoryId } = req.query;
  const userId = req.params.id;
  let budgeted = await Budgets.findOneAndUpdate(
    { userId, categoryId },
    req.body,
    { new: true }
  );
  res.status(200).json({
    status: "success",
    budgeted,
  });
});
