// controllers/reviewController.js
import mongoose from "mongoose";
import User from "../models/userModel.js";
import Review from "../models/reviewModel.js";
import Order from "../models/orderModel.js";

// @desc    Create a new review (only for delivered orders)
// @route   POST /api/reviews/:productId
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;
    const userId = req.user.id;

    // Find delivered order that contains this product
    const deliveredOrder = await Order.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      "items.productId": new mongoose.Types.ObjectId(productId),
      status: { $regex: /^delivered$/i },
    });

    if (!deliveredOrder) {
      return res.status(400).json({
        message: "You can only review products after delivery",
      });
    }

    // Prevent duplicate reviews
    const alreadyReviewed = await Review.findOne({
      user: new mongoose.Types.ObjectId(userId),
      product: new mongoose.Types.ObjectId(productId),
    });

    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this product" });
    }

    // Create review
    const review = await Review.create({
      product: new mongoose.Types.ObjectId(productId),
      user: new mongoose.Types.ObjectId(userId),
      rating,
      comment,
    });

    // ✅ Mark this product as reviewed in the order
    await Order.updateOne(
  { _id: deliveredOrder._id, "items.productId": new mongoose.Types.ObjectId(productId) },
  { $set: { "items.$.reviewed": true } }
);


    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({
      product: new mongoose.Types.ObjectId(productId),
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
};
