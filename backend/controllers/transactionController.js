const { Transactions } = require("../models/transactionModel");
const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { generateReport } = require("../utils/report");
const { Budgets } = require("../models/budgetModel");
const { Accounts } = require("../models/accountModel");

exports.getAllTransactions = catchAsync(async (req, res, next) => {
  const { month } = req.query;

  const allTransaction = await Transactions.aggregate([
    {
      $match: {
        userId: req.user._id,
        month,
      },
    },

    {
      $lookup: {
        from: "categories", // The collection name for categories
        localField: "category", // Field from the Transactions collection
        foreignField: "_id", // Field from the Categories collection
        as: "categoryDetails", // The name of the field to store the joined category
      },
    },
    {
      $lookup: {
        from: "accounts", // The collection name for accounts
        localField: "account", // Field from the Transactions collection
        foreignField: "_id", // Field from the Accounts collection
        as: "accountDetails", // The name of the field to store the joined account
      },
    },
    {
      $lookup: {
        from: "accounts", // The collection name for accounts
        localField: "toAccount", // Field from the Transactions collection
        foreignField: "_id", // Field from the Accounts collection
        as: "toAccount", // The name of the field to store the joined account
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $addFields: {
        formattedDate: {
          $dateToString: { format: "%Y-%m-%d", date: "$date" }, // Extract only the date part
        },
      },
    },
    {
      $group: {
        _id: "$formattedDate", // Group by the formatted date
        transactions: {
          $push: {
            _id: "$_id",
            category: "$categoryDetails",
            account: "$accountDetails",
            amount: "$amount",
            description: "$description",
            month: "$month",
            userId: "$userId",
            type: "$type",
            toAccount: "$toAccount",
            time: "$time",
            createdAt: "$createdAt",
          },
        },
      },
    },
    {
      $sort: {
        _id: -1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: allTransaction,
  });
});
exports.createTransaction = catchAsync(async (req, res, next) => {
  let data = req.body;

  if (data.type === "expense") {
    let budget = await Budgets.findOne({
      month: data.month,
      userId: req.user._id,
      categoryId: data.category,
    });
    if (budget) {
      budget.spend += data.amount;
      await budget.save();
    }
  }

  data.userId = req.user._id;
  let newTransaction = await Transactions.create(data);
  res.status(201).json({
    newTransaction,
  });

  let { type, account, toAccount, amount } = req.body;
  if (type == "transfer") {
    let fromAccount = await Accounts.findOne({
      _id: account,
      userId: req.user._id,
    });
    let receiveAccount = await Accounts.findOne({
      _id: toAccount,
      userId: req.user._id,
    });

    fromAccount.balance -= amount;
    receiveAccount.balance += amount;
    await fromAccount.save();
    await receiveAccount.save();
  }
});

exports.updateTransaction = async (req, res, next) => {
  let oldOne = await Transactions.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  /*The category id is not changed mean user only update the amount or notes or something;
  1)---->Then using the category id to check weather the budeget is set.. if set the caluclate spend and remaing;
  2)----> if the category is changed then remove the budget from current category and check the budget is setted for 
  new category if set the add the spend and remaining;
  */
  if (oldOne.category == req.body.category) {
    let budget = await Budgets.findOne({
      userId: req.user._id,
      categoryId: oldOne.category,
    });

    if (budget) {
      budget.spend -= oldOne.amount;
      budget.spend += req.body.amount;

      await budget.save();
    }
    oldOne.amount = req.body.amount;
    await oldOne.save();
    // =-0==-=-=-=-=-=-=-==-===-=-=-=RETURN-=-=-=-=-=-=-=-==-==-=-=-==-=-=-=-=-=-=-=-=-=-=-
  } else {
    let budget = await Budgets.findOne({
      userId: req.user._id,
      categoryId: oldOne.category,
    });

    if (budget) {
      budget.spend -= oldOne.amount;
      await budget.save();
    }
    const newCategory = await Budgets.findOne({
      userId: req.user._id,
      categoryId: req.body.category,
    });

    if (newCategory) {
      newCategory.spend += req.body.amount;
      await newCategory.save();
    }
  }

  try {
    if (req.body.type == "transfer" && req.body.previousType == "transfer") {
      let {
        type,
        account,
        toAccount,
        amount,
        previousAmount,
        previousFromAccount,
        previousToAccount,
      } = req.body;
      if (previousFromAccount === account && previousToAccount === toAccount) {
        let fromAccount = await Accounts.findOne({
          _id: account,
          userId: req.user._id,
        });
        let receiveAccount = await Accounts.findOne({
          _id: toAccount,
          userId: req.user._id,
        });

        if (previousAmount) {
          fromAccount.balance += Number(previousAmount);
          receiveAccount.balance -= Number(previousAmount);
        }

        fromAccount.balance -= amount;
        receiveAccount.balance += amount;
        await fromAccount.save();
        await receiveAccount.save();
      } else if (
        previousFromAccount === account &&
        previousToAccount !== toAccount
      ) {
        let fromAccount = await Accounts.findOne({
          _id: account,
          userId: req.user._id,
        });

        let receiveAccount = await Accounts.findOne({
          _id: previousToAccount,
          userId: req.user._id,
        });

        if (previousAmount) {
          fromAccount.balance += Number(previousAmount);
          receiveAccount.balance -= Number(previousAmount);
        }

        let newReceiveAccount = await Accounts.findOne({
          _id: toAccount,
          userId: req.user._id,
        });

        fromAccount.balance -= amount;
        newReceiveAccount.balance += amount;
        await fromAccount.save();
        await receiveAccount.save();
        await newReceiveAccount.save();
      } else if (
        previousFromAccount !== account &&
        previousToAccount === toAccount
      ) {
        let fromAccount = await Accounts.findOne({
          _id: previousFromAccount,
          userId: req.user._id,
        });

        let receiveAccount = await Accounts.findOne({
          _id: previousToAccount,
          userId: req.user._id,
        });

        if (previousAmount) {
          fromAccount.balance += Number(previousAmount);
          receiveAccount.balance -= Number(previousAmount);
        }

        let newFromAccount = await Accounts.findOne({
          _id: account,
          userId: req.user._id,
        });

        newFromAccount.balance -= amount;
        receiveAccount.balance += amount;
        await fromAccount.save();
        await receiveAccount.save();
        await newFromAccount.save();
      } else if (
        previousFromAccount !== account &&
        previousToAccount !== toAccount
      ) {
        let fromAccount = await Accounts.findOne({
          _id: previousFromAccount,
          userId: req.user._id,
        });

        let receiveAccount = await Accounts.findOne({
          _id: previousToAccount,
          userId: req.user._id,
        });

        if (previousAmount) {
          fromAccount.balance += Number(previousAmount);
          receiveAccount.balance -= Number(previousAmount);
        }

        await fromAccount.save();
        await receiveAccount.save();

        let newFromAccount = await Accounts.findOne({
          _id: account,
          userId: req.user._id,
        });

        let newToAccount = await Accounts.findOne({
          _id: toAccount,
          userId: req.user._id,
        });

        newFromAccount.balance -= amount;
        newToAccount.balance += amount;

        await newFromAccount.save();
        await newToAccount.save();
      }
    } else if (
      req.body.type == "expense" &&
      req.body.previousType == "transfer"
    ) {
      let {
        account,
        amount,
        previousAmount,
        previousFromAccount,
        previousToAccount,
      } = req.body;

      let fromAccount = await Accounts.findOne({
        _id: previousFromAccount,
        userId: req.user._id,
      });
      let receiveAccount = await Accounts.findOne({
        _id: previousToAccount,
        userId: req.user._id,
      });

      if (previousAmount) {
        fromAccount.balance += Number(previousAmount);
        receiveAccount.balance -= Number(previousAmount);
      }

      await fromAccount.save();
      await receiveAccount.save();
    } else if (
      req.body.type == "income" &&
      req.body.previousType == "transfer"
    ) {
      let {
        account,
        amount,
        previousAmount,
        previousFromAccount,
        previousToAccount,
      } = req.body;

      let fromAccount = await Accounts.findOne({
        _id: previousFromAccount,
        userId: req.user._id,
      });
      let receiveAccount = await Accounts.findOne({
        _id: previousToAccount,
        userId: req.user._id,
      });

      if (previousAmount) {
        fromAccount.balance += Number(previousAmount);
        receiveAccount.balance -= Number(previousAmount);
      }

      await fromAccount.save();
      await receiveAccount.save();
    } else if (
      req.body.type == "transfer" &&
      req.body.previousType == "income"
    ) {
    } else if (
      req.body.type == "transfer" &&
      req.body.previousType == "income"
    ) {
       
    } else if (
      req.body.type == "transfer" &&
      req.body.previousType == "income"
    ) {
     
      let {
        account,
        amount,
        previousAmount,
        previousFromAccount,
        previousToAccount,
        toAccount,
      } = req.body;

      let oldAccount = await Accounts.findOne({
        _id: previousFromAccount,
        userId: req.user._id,
      });

      if (previousAmount) {
        oldAccount.balance -= Number(previousAmount);
        await oldAccount.save();
      }

      let fromAccount = await Accounts.findOne({
        _id: account,
        userId: req.user._id,
      });

      let receiveAccount = await Accounts.findOne({
        _id: toAccount,
        userId: req.user._id,
      });

      // fromAccount.balance -= amount;
      receiveAccount.balance += amount;

      await fromAccount.save();
      await receiveAccount.save();
    } else if (
      req.body.type == "transfer" &&
      req.body.previousType == "expense"
    ) {
      let {
        account,
        amount,
        previousAmount,
        previousFromAccount,
        previousToAccount,
        toAccount,
      } = req.body;

      let oldAccount = await Accounts.findOne({
        _id: previousFromAccount,
        userId: req.user._id,
      });

      if (previousAmount) {
        oldAccount.balance -= Number(previousAmount);
        await oldAccount.save();
      }

      let fromAccount = await Accounts.findOne({
        _id: account,
        userId: req.user._id,
      });

      let receiveAccount = await Accounts.findOne({
        _id: toAccount,
        userId: req.user._id,
      });

      // fromAccount.balance -= amount;
      receiveAccount.balance += amount;

      await fromAccount.save();
      await receiveAccount.save();
    }
  } catch (e) {
    console.log(e);
  }

  let updatedTransaction = await Transactions.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!updatedTransaction) {
    return next(new AppError("Invalid ID", 404));
  }
  res.status(200).json({
    updatedTransaction,
  });
};

exports.deleteTransaction = catchAsync(async (req, res, next) => {
  let delTransaction = await Transactions.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  let { type, account, toAccount, amount } = delTransaction;
  if (type == "transfer") {
    let fromAccount = await Accounts.findOne({
      _id: account,
      userId: req.user._id,
    });
    let receiveAccount = await Accounts.findOne({
      _id: toAccount,
      userId: req.user._id,
    });

    fromAccount.balance += amount;
    receiveAccount.balance -= amount;
    await fromAccount.save();
    await receiveAccount.save();
  }

  let budget = await Budgets.findOne({
    userId: req.user._id,
    categoryId: delTransaction.category,
  });

  if (budget) {
    budget.spend -= delTransaction.amount;
    await budget.save();
  }

  await Transactions.deleteOne({ _id: req.params.id });
  res.status(204).json({});
});

exports.records = catchAsync(async (req, res, next) => {
  let month = req.query.month;
  let userId = req.user._id;
  let data = await Transactions.aggregate([
    { $match: { month, userId } },
    {
      $lookup: {
        from: "accounts",
        localField: "account",
        foreignField: "_id",
        as: "accountInfo",
      },
    },
    { $unwind: { path: "$accountInfo", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
  ]);

  generateReport(data, res);
});

exports.getAccountsBalance = catchAsync(async (req, res, next) => {
  let userAccounts = await Accounts.aggregate([
    { $match: { userId: req.user._id } },
    {
      $lookup: {
        from: "transactions",
        localField: "_id",
        foreignField: "account",
        as: "transactions",
      },
    },
    {
      $unwind: {
        path: "$transactions",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        accountName: "$accountName",
        accountImage: "$icon",
        balance: "$balance", // Base balance of the account
      },
    },
    {
      $group: {
        _id: "$_id",
        accountName: { $first: "$accountName" },
        accountImage: { $first: "$accountImage" },
        balance: { $first: "$balance" }, // Base balance
        totalIncome: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ["$transactions", null] },
                  { $eq: ["$transactions.type", "income"] },
                ],
              },
              "$transactions.amount",
              0,
            ],
          },
        },
        totalExpense: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ["$transactions", null] },
                  { $eq: ["$transactions.type", "expense"] },
                ],
              },
              "$transactions.amount",
              0,
            ],
          },
        },
      },
    },
    {
      $addFields: {
        netBalance: { $subtract: ["$totalIncome", "$totalExpense"] }, // Step 2: Income - Expense
        finalAccountBalance: {
          $add: ["$balance", { $subtract: ["$totalIncome", "$totalExpense"] }],
        }, // Step 3: Base balance + Net balance
      },
    },
    {
      $sort: { accountName: 1 },
    },
  ]);

  // Retain the total income and expense across all accounts
  let totalIncomeAcrossAccounts = userAccounts.reduce(
    (total, account) => total + account.totalIncome,
    0
  );
  let totalExpenseAcrossAccounts = userAccounts.reduce(
    (total, account) => total + account.totalExpense,
    0
  );

  // Calculate allAccountsBalance by summing up finalAccountBalance across all accounts
  let allAccountsBalance = userAccounts.reduce(
    (total, account) => total + account.finalAccountBalance,
    0
  );

  // Send response
  res.status(200).json({
    status: "success 🎉💥",
    userAccounts,
    totalIncomeAcrossAccounts,
    totalExpenseAcrossAccounts,
    allAccountsBalance,
  });
});

exports.getHeaderInfo = catchAsync(async (req, res, next) => {
  let headerInfo = await Transactions.aggregate([
    {
      $match: {
        userId: req.user._id,
        month: req.query.month,
      },
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);

  // Transform the data for better usability
  const incomeTotal =
    headerInfo.find((info) => info._id === "income")?.total || 0;
  const expenseTotal =
    headerInfo.find((info) => info._id === "expense")?.total || 0;

  // Send response
  res.status(200).json({
    status: "success",

    incomeTotal,
    expenseTotal,
    overAllTotal: incomeTotal - expenseTotal,
  });
});
