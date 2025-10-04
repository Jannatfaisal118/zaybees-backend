import Voucher from "../models/voucherModel.js";

// ✅ Admin: Create voucher
export const createVoucher = async (req, res) => {
  try {
    const voucher = new Voucher(req.body);
    await voucher.save();
    res.status(201).json({ success: true, voucher });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ Admin: Get all vouchers
export const getVouchers = async (_req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.json({ success: true, vouchers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Admin: Update voucher
export const updateVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, voucher });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ Admin: Delete voucher
export const deleteVoucher = async (req, res) => {
  try {
    await Voucher.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Voucher deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ User: Validate voucher
export const validateVoucher = async (req, res) => {
  try {
    const { code } = req.body;
    const voucher = await Voucher.findOne({ code: code.toUpperCase() });

    if (!voucher) return res.status(404).json({ success: false, message: "Invalid code" });

    const now = new Date();
    if (voucher.status !== "active" || now < voucher.startDate || now > voucher.endDate) {
      return res.status(400).json({ success: false, message: "Voucher expired or inactive" });
    }

    if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({ success: false, message: "Voucher usage limit reached" });
    }

    res.json({
      success: true,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
