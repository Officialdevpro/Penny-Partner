const express = require("express");
const { visualizeData } = require("../controllers/analysController");
const { product } = require("../controllers/authController");
const router = express.Router();

router.route("/").get(product,visualizeData);

module.exports = router;
