// models/reviewModel.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {   // ✅ match controller
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    user: {   // ✅ match controller
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;
