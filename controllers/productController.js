import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import reviewModel from "../models/reviewModel.js";

// Add product
const addProduct = async (req, res) => {
  try {
    const {
      productId,
      name,
      description,
      price,
      category,
      subCategory,
      collection,
      sizes,
      colors,
      bestseller,
      stock,
      sku,
      barcode,
      seoTitle,
      seoDescription,
      weight,
      dimensions,
      shippingClass,
      customsCode,
      tags,
      returnPolicy,
    } = req.body;

    if (!name || !price || !category || !stock) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    if (isNaN(stock) || Number(stock) < 0 || isNaN(price) || Number(price) < 0) {
      return res.status(400).json({ success: false, message: "Stock and price must be non-negative numbers" });
    }

    // Upload images dynamically
    const files = Object.values(req.files || {}).flat();
    const imagesUrl = await Promise.all(
      files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, { resource_type: "image" });
        return result.secure_url;
      })
    );

    const productData = {
      productId,
      name,
      description,
      category,
      subCategory: subCategory || "",
      collection: collection || "",
      price: Number(price),
      stock: Number(stock),
      bestseller: bestseller === "true" || bestseller === true,
      sizes: sizes ? JSON.parse(sizes) : [],
      colors: colors ? JSON.parse(colors) : [],
      sku: sku || "",
      barcode: barcode || "",
      seoTitle: seoTitle || "",
      seoDescription: seoDescription || "",
      weight: weight ? Number(weight) : 0,
      dimensions: dimensions || "",
      shippingClass: shippingClass || "",
      customsCode: customsCode || "",
      tags: tags ? JSON.parse(tags) : [],
      returnPolicy: returnPolicy || "",
      image: imagesUrl,
      date: Date.now(),
    };

    const product = new productModel(productData);
    await product.save();

    res.status(201).json({ success: true, message: "Product Added", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// List all products
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove a product
const removeProduct = async (req, res) => {
  try {
    const deleted = await productModel.findByIdAndDelete(req.body.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Single product info with reviews
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const reviews = await reviewModel
      .find({ productId, status: "approved" })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / reviews.length
        : 0;

    res.json({ success: true, product, reviews, avgRating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { listProducts, addProduct, removeProduct, singleProduct };
