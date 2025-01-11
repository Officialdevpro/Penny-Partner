const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const app  = require("./app.js");

dotenv.config({ path: path.join(__dirname, ".env") });

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    // Start the server
    const port = process.env.PORT || 8080;
    app.listen(port, () => console.log(`Server is listening on port ${port}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });
