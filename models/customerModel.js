import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    country: { type: String },
    totalOrders: { type: Number, default: 0 },
    totalSpend: { type: Number, default: 0 },
    lastOrder: { type: Date },
    status: { type: String, enum: ["Active", "Inactive", "Banned"], default: "Active" },
    loyaltyTier: { type: String, enum: ["Bronze", "Silver", "Gold", "Platinum"], default: "Bronze" },
    addresses: [
      {
        type: { type: String }, // shipping/billing
        addressLine: String,
        city: String,
        zip: String,
        country: String,
      }
    ],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
