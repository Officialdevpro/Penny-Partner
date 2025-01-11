const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["income", "expense", "transfer"],
  },
  image: {
    type: String,
    required: true,
  },

  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  
});

exports.Categories = mongoose.model("Categories", categorySchema);
