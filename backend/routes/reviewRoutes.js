const express = require("express");
const {
  getAllReviews,
  createReviews,
  deleteReview,
  updateReviews,
} = require("../controllers/reviewController");
const { product } = require("../controllers/authController");

const router = express.Router();

router.route("/").get(product, getAllReviews).post(product,createReviews)

router.route("/:id").patch(product,updateReviews).delete(product,deleteReview);

module.exports = router;
