const { defaultAccounts } = require("../data/defaultAccounts");
const { defaultCategories } = require("../data/defaultCategories");
const { Accounts } = require("../models/accountModel");
const { Categories } = require("../models/categoryModel");

exports.createDefaultData = async (userId) => {
  let updateUserIdToCategories = defaultCategories.map((item) => {
    item.userId = userId;
    return item;
  });

  let updateUserIdToAccounts = defaultAccounts.map((item) => {
    item.userId = userId;
    return item;
  });
  await Categories.insertMany(updateUserIdToCategories);
  await Accounts.insertMany(updateUserIdToAccounts);
};
