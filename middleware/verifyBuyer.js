import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";

// Middleware to check if user bought the product and hasn't reviewed it yet
const verifyBuyer = async (req, res, next) => {
  const userId = req.user._id; // from auth middleware
  const { productId } = req.params;

  try {
    // ✅ Find orders where this user purchased this product
    const orders = await orderModel.find({
      userId,
      "items.productId": productId
    });

    if (!orders || orders.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You cannot review this product without purchasing it."
      });
    }

    // ✅ Check if any order item is not yet reviewed
    let canReview = false;
    let purchaseDate = null;

    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.productId.toString() === productId && !item.reviewed) {
          canReview = true;
          purchaseDate = item.purchaseDate;
        }
      });
    });

    if (!canReview) {
      return res.status(403).json({
        success: false,
        message: "You have already reviewed this product."
      });
    }

    // Pass purchaseDate to req for creating verified review
    req.purchaseDate = purchaseDate;
    next();
  } catch (error) {
    console.error("verifyBuyer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error verifying purchase."
    });
  }
};

export default verifyBuyer;
