const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  icon: {
    type: String,
    required: true,
  },
  accountName: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  userId :{
    type: mongoose.Types.ObjectId,
    ref:"User",

  }
});

exports.Accounts = mongoose.model("Accounts", accountSchema);
