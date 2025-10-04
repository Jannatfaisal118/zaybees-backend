// routes/reviewRoute.js
import express from "express";
import { createReview, getProductReviews } from "../controllers/reviewController.js";
import authUser from "../middleware/auth.js"; // assuming you already have this for protecting routes

const reviewRouter = express.Router();

// POST: Create a review (only logged-in customers can review)
reviewRouter.post("/:productId", authUser, createReview);

// GET: Fetch all reviews for a product
reviewRouter.get("/:productId", getProductReviews);

export default reviewRouter;
