const { Budgets } = require("../models/budgetModel");
const { Categories } = require("../models/categoryModel");
const { Transactions } = require("../models/transactionModel");
const catchAsync = require("../utils/catchAsync");

exports.getBudgets = catchAsync(async (req, res, next) => {
  let userId = req.user._id;

  const budgets = await Budgets.find({
    userId,
    month: req.query.month,
  }).populate("categoryId");

  const userCategoreis = await Categories.find({ userId, type: "expense" });

  let a = budgets.map((item) => item.categoryId.id);

  let unBudgeted = userCategoreis.filter((item) => !a.includes(item.id));

  res.status(200).json({
    status: "success",
    data: [
      {
        budgeted: budgets,
        unBudgeted,
      },
    ],
  });
});

exports.setBudget = catchAsync(async (req, res, next) => {
  let data = req.body;
  data.userId = req.user._id;

  let a = await Transactions.find({
    userId: req.user._id,
    month: req.body.month,
    category: req.body.categoryId,
  });
 
  let sum = a.reduce((acc, item) => acc + item.amount, 0);

  data.spend = sum || 0;
  let newBudgets = await Budgets.create(req.body);
  res.status(201).json({
    status: "success",
    data: newBudgets,
  });
});

exports.updateBudget = catchAsync(async (req, res, next) => {
  let update = await Budgets.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).json({
    status: "success",
    data: update,
  });
});

exports.deleteBudget = catchAsync(async (req, res, next) => {
  let update = await Budgets.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: "success",
  });
});
