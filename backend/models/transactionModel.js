const mongoose = require("mongoose");
const { Accounts } = require("./accountModel");
const { Categories } = require("./categoryModel"); // Assuming you have a Categories model

const transactionSchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: true,
    },

    date: {
      type: Date,  
      required: true,
      default: Date.now,  
    },

    category: {
      type: mongoose.Types.ObjectId,
      ref: "Categories", // Reference to Category model
      // required: true,
    },
    account: {
      type: mongoose.Types.ObjectId,
      ref: "Accounts", // Reference to Accounts model
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: "No notes",
    },

    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "expense", "transfer"],
      required: true,
    },

    toAccount: {
      type: mongoose.Types.ObjectId,
      ref: "Accounts",
      required: function () {
        return this.type === "transfer"; // Only required if type is 'transfer'
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Pre-save hook to manage conditional fields based on 'type'
transactionSchema.pre("save", function (next) {
  if (this.type !== "transfer") {
    // If the type is not 'transfer', remove  'toAccount'
    this.toAccount = undefined;
  }
  next();
});

exports.Transactions = mongoose.model("Transactions", transactionSchema);
