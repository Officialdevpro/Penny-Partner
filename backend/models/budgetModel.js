const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true,
  },

  categoryId: {
    type: mongoose.Types.ObjectId,
    ref: "Categories",
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  spend: {
    type: Number,
    required: true,
    default: 0,
  },

  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

budgetSchema.virtual("remaining").get(function () {
  return this.budget - this.spend;
});

// Ensure virtuals are included when converting to JSON or Object
budgetSchema.set("toJSON", { virtuals: true });
budgetSchema.set("toObject", { virtuals: true });

exports.Budgets = mongoose.model("Budgets", budgetSchema);
