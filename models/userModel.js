import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product', default: [] }], // ← Add this
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
},
  { 
    minimize: false,
    timestamps: true
  }
);

const userModel = mongoose.models.user || mongoose.model('user', userSchema);
export default userModel;
