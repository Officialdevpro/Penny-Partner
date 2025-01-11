const mongoose = require("mongoose");
const tempSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  otpExpires: Date,
  otp:String,
});

const TempUsers = mongoose.model("TempUsers", tempSchema);

module.exports = TempUsers;
