// routes/voucherRoute.js
import express from "express";
import Voucher from "../models/voucherModel.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const voucherRouter = express.Router();

// GET /api/voucher => fetch all vouchers
voucherRouter.get("/", adminAuth, async (req, res) => {
  try {
    const vouchers = await Voucher.find({});
    return res.json({ success: true, vouchers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/voucher => add new voucher
voucherRouter.post("/", adminAuth, async (req, res) => {
  try {
    const data = req.body;

    // Parse date strings to Date objects
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.expiryDate = new Date(data.endDate);

    const voucher = new Voucher(data);
    await voucher.save();
    return res.json({ success: true, voucher });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/voucher/:id => update voucher
voucherRouter.put("/:id", adminAuth, async (req, res) => {
  const voucherId = req.params.id;
  const updateData = req.body;

  try {
    // Convert date strings to Date objects
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.expiryDate = new Date(updateData.endDate);

    const updatedVoucher = await Voucher.findByIdAndUpdate(voucherId, updateData, {
      new: true,
    });

    if (!updatedVoucher)
      return res.status(404).json({ success: false, message: "Voucher not found" });

    return res.json({ success: true, voucher: updatedVoucher });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/voucher/:id => delete voucher
voucherRouter.delete("/:id", adminAuth, async (req, res) => {
  try {
    const deletedVoucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!deletedVoucher)
      return res.status(404).json({ success: false, message: "Voucher not found" });
    return res.json({ success: true, message: "Voucher deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/voucher/validate => validate voucher for cart
voucherRouter.post("/validate", authUser, async (req, res) => {
  const { code, cartItems } = req.body;
  const userId = req.user?._id;

  try {
    const voucher = await Voucher.findOne({ code: code.toUpperCase() });
    if (!voucher)
      return res.json({ success: false, message: "Voucher not found" });

    const now = new Date();
    if (!voucher.isActive || voucher.startDate > now || voucher.expiryDate < now) {
      return res.json({ success: false, message: "Voucher expired or inactive" });
    }

    // Usage limits
    if (voucher.usageLimit && voucher.timesUsed >= voucher.usageLimit) {
      return res.json({ success: false, message: "Voucher usage limit reached" });
    }

    // User-specific usage
    if (voucher.userLimit && userId) {
      const userUsage = voucher.usersUsed?.filter(
        (u) => u.toString() === userId.toString()
      ).length;
      if (userUsage >= voucher.userLimit) {
        return res.json({
          success: false,
          message: "You have already used this voucher maximum times",
        });
      }
    }

    // Minimum cart total
    let cartTotal = 0;
    const productIdsInCart = Object.keys(cartItems || {});
    for (const id of productIdsInCart) {
      const sizes = cartItems[id];
      for (const size in sizes) {
        const productPrice =
          voucher.products?.find((p) => p._id.toString() === id)?.price || 0;
        cartTotal += sizes[size] * productPrice;
      }
    }

    if (voucher.minCartValue && cartTotal < voucher.minCartValue) {
      return res.json({
        success: false,
        message: `Minimum cart value of Rs.${voucher.minCartValue} required`,
      });
    }

    // Product/category restrictions
    if (voucher.restrictedProducts?.length > 0) {
      const allowed = productIdsInCart.some((pid) =>
        voucher.restrictedProducts.includes(pid)
      );
      if (!allowed) {
        return res.json({
          success: false,
          message: "Voucher not applicable for selected products",
        });
      }
    }

    if (voucher.restrictedCategories?.length > 0) {
      const allowed = productIdsInCart.some(
        (pid) =>
          voucher.restrictedCategories.includes(
            voucher.products?.find((p) => p._id.toString() === pid)?.category
          )
      );
      if (!allowed) {
        return res.json({
          success: false,
          message: "Voucher not applicable for selected categories",
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (voucher.discountType === "percentage") {
      discountAmount = (cartTotal * voucher.discountValue) / 100;
    } else {
      discountAmount = voucher.discountValue;
    }
    if (discountAmount > cartTotal) discountAmount = cartTotal;

    return res.json({
      success: true,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      discountAmount,
      message: "Voucher is valid",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default voucherRouter;
