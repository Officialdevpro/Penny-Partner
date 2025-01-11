const { Accounts } = require("../models/accountModel");
const { Transactions } = require("../models/transactionModel");
const catchAsync = require("../utils/catchAsync");

exports.createAccount = catchAsync(async (req, res, next) => {
  const newAccount = await Accounts.create({
    icon: req.body.icon,
    accountName: req.body.accountName,
    balance: req.body.balance,
    userId: req.user._id,
  });
  res.status(201).json({
    status: "success",
    data: newAccount,
  });
});

exports.getAllAccounts = catchAsync(async (req, res, next) => {
  const accounts = await Accounts.find({ userId: req.user._id });
  res.status(200).json({
    status: "success",
    data: accounts,
  });
});

exports.updateAccount = catchAsync(async (req, res, next) => {
  const updatedAccount = await Accounts.findByIdAndUpdate(
    req.params.id,
    req.body,
    { runValidators: true }
  );
  res.status(200).json({
    status: "success",
    message: "successfully Updated",
    data: updatedAccount,
  });
});

exports.deleteAccount = catchAsync(async (req, res, next) => {
  await Transactions.deleteMany({
    account: req.params.id,
    userId: req.user._id,
  });

  await Accounts.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: "sucess",
    message: "successfully deleted.",
  });
});

exports.cumulativeSummary = catchAsync(async (req, res, next) => {
  let summary = await Transactions.aggregate([
    {
      $match: {
        userId: req.user._id,
      },
    },
    {
      $group: {
        _id: "$type",
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $project: {
        type: "$_id",
        totalAmount: 1,
        _id: 0,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    summary,
  });
});

exports.updateBalance = catchAsync(async (req, res, next) => {
  if (req.body.accountId !== req.body.previousAccountId) {
  
    let previousAccount = await Accounts.findOne({
      userId: req.user._id,
      _id: req.body.previousAccountId,
    });
  
    
    if (previousAccount && req.body.oldType == "income") {
      previousAccount.balance -= req.body.previousAmount;
    } else if (previousAccount && req.body.oldType == "expense") {
      previousAccount.balance += req.body.previousAmount;
    }
    await previousAccount.save();
    let newAccount = await Accounts.findOne({
      userId: req.user._id,
      _id: req.body.accountId,
    });
   
    if (newAccount) {
      newAccount.balance += req.body.amount;
      await newAccount.save();
    }

   

    return;
  }

  const account = await Accounts.findOne({
    userId: req.user._id,
    _id: req.params.id,
  });

  if (!account) {
    return res.status(404).json({
      status: "fail",
      message: "Account not found",
    });
  }

  

  if (req.body.operation == "deposite" && req.body.type == "income") {
    if (req.body.oldType == "expense") {
      account.balance += Number(req.body.previousAmount);
    } else {
      account.balance -= Number(req.body.previousAmount);
    }

    account.balance += Number(req.body.amount);
  } else if (req.body.operation == "deposite" && req.body.type == "expense") {
    if (req.body.oldType == "income") {
      account.balance -= Number(req.body.previousAmount);
    } else {
      account.balance += Number(req.body.previousAmount);
    }

    account.balance -= Number(req.body.amount);
    await account.save();
   
  } else if ((req.body.operation = "withdraw" && req.body.type == "income")) {
    account.balance -= Number(req.body.amount);
  } else if ((req.body.operation = "withdraw" && req.body.type == "expense")) {
    account.balance += Number(req.body.amount);
  }

  await account.save();

  res.status(200).json({
    status: "success",
    message: "Successfully Updated",
    data: account,
  });
});
