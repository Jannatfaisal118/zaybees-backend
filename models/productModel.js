import mongoose from 'mongoose';

// -------------------- Product Schema --------------------
const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: Array, required: true }, // URLs from Cloudinary
  category: { type: String, required: true },
  subCategory: { type: String, required: false },
  collection: { type: String, required: false },
  sizes: { type: [String], default: [] },
  colors: { type: [String], default: [] },
  bestseller: { type: Boolean, default: false },
  stock: { type: Number, required: true, default: 0, min: 0 },
  sku: { type: String },
  barcode: { type: String },

  // -------------------- SEO & Marketing --------------------
  seoTitle: { type: String },
  seoDescription: { type: String },

  // -------------------- Shipping & Logistics --------------------
  weight: { type: Number, default: 0 }, // in kg
  dimensions: { type: String }, // LxWxH
  shippingClass: { type: String },
  customsCode: { type: String },

  // -------------------- Customer-Facing --------------------
  tags: { type: [String], default: [] },
  returnPolicy: { type: String },

  // -------------------- Reviews --------------------
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  ratingBreakdown: {
    1: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    5: { type: Number, default: 0 },
  },

  date: { type: Number, required: true, default: Date.now },
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);
export default productModel;
