// models/voucherModel.js
import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    description: { type: String },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true },
    minCartValue: { type: Number, default: 0 },
    restrictedProducts: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ],
    restrictedCategories: [{ type: String }],
    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number, default: 0 },
    timesUsed: { type: Number, default: 0 },
    userLimit: { type: Number, default: 0 },
    usersUsed: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const voucherModel = mongoose.models.Voucher || mongoose.model("Voucher", voucherSchema);

export default voucherModel;
