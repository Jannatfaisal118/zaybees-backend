import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import voucherModel from "../models/voucherModel.js";
import crypto from "crypto";

// global variables
const currency = "pkr";
const deliveryCharges = 100;

// Placing orders using COD method
const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, amount, address, voucherCode, deliveryType } = req.body;

    let discount = 0;
    let finalAmount = amount;

    // ✅ Apply voucher if exists
    if (voucherCode) {
      const voucher = await voucherModel.findOne({ code: voucherCode.toUpperCase() });
      if (voucher && voucher.status === "active") {
        if (voucher.discountType === "percentage") {
          discount = (amount * voucher.discountValue) / 100;
        } else {
          discount = voucher.discountValue;
        }
        finalAmount = Math.max(amount - discount, 0);
        voucher.usedCount = (voucher.usedCount || 0) + 1;
        await voucher.save();
      }
    }

    const orderItems = items.map(i => ({
      productId: i.productId,
      name: i.name,
      size: i.size,
      quantity: i.quantity,
      price: i.price
    }));

const newOrder = new orderModel({
  userId,
  items: orderItems,
  amount,
  finalAmount,
  discount,
  voucher: voucherCode || null,
  address,
  paymentMethod: "COD",
  payment: false,
  date: Date.now(),
  deliveryType: deliveryType || "Standard" // ✅
});

    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order placed successfully" });
    console.log("📦 Received order:", { userId, items: orderItems, amount, finalAmount, voucherCode, address });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// helper: create merchantHashedReq for EasyPaisa
function createEasyPaisaHash(payloadObject, secretKey) {
  const keys = Object.keys(payloadObject).sort();
  const dataString = keys.map(k => `${k}=${payloadObject[k]}`).join("&");
  const cipher = crypto.createCipheriv(
    "aes-128-ecb",
    Buffer.from(secretKey, "utf8"),
    null
  );
  cipher.setAutoPadding(true);
  const encrypted = Buffer.concat([cipher.update(dataString, "utf8"), cipher.final()]);
  return encrypted.toString("base64");
}

const placeEasyPaisaOrder = async (req, res) => {
  try {
    const { items, amount, address, voucherCode } = req.body;

    let discount = 0;
    let finalAmount = amount;

    if (voucherCode) {
      const voucher = await voucherModel.findOne({ code: voucherCode.toUpperCase() });
      if (voucher && voucher.status === "active") {
        discount = voucher.discountType === "percentage"
          ? (amount * voucher.discountValue) / 100
          : voucher.discountValue;
        finalAmount = Math.max(amount - discount, 0);
        voucher.usedCount = (voucher.usedCount || 0) + 1;
        await voucher.save();
      }
    }

    const orderItems = items.map(i => ({
      productId: i.productId,
      name: i.name,
      size: i.size,
      quantity: i.quantity,
      price: i.price
    }));

 const newOrder = new orderModel({
  userId,
  items: orderItems,
  amount,
  finalAmount,
  discount,
  voucher: voucherCode || null,
  address,
  paymentMethod: "COD",
  payment: false,
  date: Date.now(),
  deliveryType: deliveryType || "Standard" // ✅
});
    await newOrder.save();

    const storeId = process.env.EASYPAISA_STORE_ID;
    const postBackURL = `${process.env.YOUR_BASE_URL || 'http://localhost:3000'}/payment/easypaisa/callback`;
    const orderRefNum = newOrder._id.toString();
    const easypayPayload = { amount: finalAmount, storeId, postBackURL, orderRefNum };

    const merchantHashedReq = createEasyPaisaHash(easypayPayload, process.env.EASYPAISA_HASH_KEY);
    const gatewayUrl = process.env.EASYPAISA_API_URL || 'https://easypay.easypaisa.com.pk/easypay/Index.jsf';

    return res.json({
      success: true,
      gatewayUrl,
      paymentFields: { ...easypayPayload, merchantHashedReq, autoRedirect: '0' }
    });

  } catch (error) {
    console.error('Easypaisa error:', error);
    res.json({ success: false, message: error.message });
  }
};

// helper: create JazzCash secure hash
function createJazzCashHash(paramsString, integritySalt) {
  return crypto.createHmac("sha256", integritySalt).update(paramsString, "utf8").digest("hex");
}

const placeJazzCashOrder = async (req, res) => {
  try {
    const { items, amount, address, voucherCode } = req.body;

    let discount = 0;
    let finalAmount = amount;

    if (voucherCode) {
      const voucher = await voucherModel.findOne({ code: voucherCode.toUpperCase() });
      if (voucher && voucher.status === "active") {
        discount = voucher.discountType === "percentage"
          ? (amount * voucher.discountValue) / 100
          : voucher.discountValue;
        finalAmount = Math.max(amount - discount, 0);
        voucher.usedCount = (voucher.usedCount || 0) + 1;
        await voucher.save();
      }
    }

    const orderItems = items.map(i => ({
      productId: i.productId,
      name: i.name,
      size: i.size,
      quantity: i.quantity,
      price: i.price
    }));

const newOrder = new orderModel({
  userId,
  items: orderItems,
  amount,
  finalAmount,
  discount,
  voucher: voucherCode || null,
  address,
  paymentMethod: "COD",
  payment: false,
  date: Date.now(),
  deliveryType: deliveryType || "Standard" // ✅
});
    await newOrder.save();

    const txnRef = newOrder._id.toString();
    const pp_Amount = Math.round(finalAmount * 100);
    const pp_TxnDateTime = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0,14);
    const paramsToSign = `${process.env.JAZZCASH_MERCHANT_ID}${process.env.JAZZCASH_PASSWORD}${txnRef}${pp_Amount}PKR${pp_TxnDateTime}`;
    const secureHash = createJazzCashHash(paramsToSign, process.env.JAZZCASH_INTEGRITY_SALT);

    const gatewayUrl = process.env.JAZZCASH_API_URL || 'https://sandbox.jazzcash.com.pk/HostedCheckout/Pages/Pay/Pay.aspx';
    const paymentFields = {
      pp_Version: '1.1',
      pp_TxnType: 'MWALLET',
      pp_Language: 'EN',
      pp_MerchantID: process.env.JAZZCASH_MERCHANT_ID,
      pp_Password: process.env.JAZZCASH_PASSWORD,
      pp_TxnRefNo: txnRef,
      pp_Amount,
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime,
      pp_ReturnURL: `${process.env.YOUR_BASE_URL || 'http://localhost:3000'}/payment/jazzcash/callback`,
      pp_SecureHash: secureHash
    };

    return res.json({ success: true, gatewayUrl, paymentFields });

  } catch (error) {
    console.error('JazzCash error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Admin panel: get all orders
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel
  .find()
  .populate("items.productId", "_id name image price") // ✅ include _id
  .sort({ date: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// User orders data
const userOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await orderModel
  .find()
  .populate("items.productId", "_id name image price") // ✅ include _id
  .sort({ date: -1 });;

    res.json({ success: true, orders });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update order status from admin panel
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Order status updated successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  placeOrder,
  placeEasyPaisaOrder,
  placeJazzCashOrder,
  allOrders,
  userOrders,
  updateStatus,
};
