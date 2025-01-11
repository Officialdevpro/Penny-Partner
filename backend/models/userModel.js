const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto"); //inbuild node module

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please tell us your name!"],
    maxlength: [20, "Username should be less than 20 letters"],
  },
  email: {
    type: String,
    required: [true, "Plese provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: true,
    minlength: [8, "Password contain atleast 8 characters"],
    select: false,
  },
  provider:{
    type:String,
    enum:["google","undefined"]
  },
  currency: {
    type: String,
    default: "₹",
  },
  chart:{
    type:String,
    default:"doughnut",
    enum:["doughnut","pie","polarArea"]
  }
  ,
  passwordChangedAt: {
    type: Date,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  profile:{
    type:String,
    default: () => `profile-${Math.floor(Math.random()*10)}.png`
  }
});

userSchema.pre("save", async function (next) {
  // Only run if password is actually modified
  if (!this.isModified("password")) next();

  this.password = await bcrypt.hash(this.password, 12);
});

//INSTANCE METHOD
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    ); //this is a base 10 number

  
    return JWTTimestamp < changedTimeStamp; //password is changed
  }

  return false;
};

//FORGET PASSWORD
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// RESET PASSWORD
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});


const User = mongoose.model("Users", userSchema);
module.exports = User;
