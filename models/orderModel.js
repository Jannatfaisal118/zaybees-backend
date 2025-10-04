// models/orderModel.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "product", 
    required: true 
  },
  name: { type: String, required: true },       // store product name directly
  size: { type: String },
  quantity: { type: Number, required: true },
  reviewed: { type: Boolean, default: false },  // ✅ track if user already reviewed this product
  purchaseDate: { type: Date, default: Date.now } // ✅ verified purchase timestamp
});

const orderSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "user", 
      required: true 
    },
    items: [orderItemSchema],
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, default: false },
    status: { type: String, default: "Order Placed" },
    date: { type: Date, default: Date.now },
    voucher: { type: String },
    discount: { type: Number, default: 0 },
    currency: { type: String, default: "PKR" },
    finalAmount: { type: Number, required: true },

    // ✅ New field
    deliveryType: { type: String, default: "Standard" } 
    // options can be: Standard, Express, Same-day etc.
  },
  { timestamps: true }
);


export default mongoose.model("orders", orderSchema);
