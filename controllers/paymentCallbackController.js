import orderModel from "../models/orderModel.js";
import crypto from 'crypto';

export const easypaisaCallback = async (req, res) => {
  try {
    const callbackData = req.body;
    
    // Extract signature/hash sent by Easypaisa, example: 
    const receivedHash = callbackData.merchantHashedReq || callbackData.signature;
    
    // Remove the hash field from data before hashing
    const dataToHash = { ...callbackData };
    delete dataToHash.merchantHashedReq;
    delete dataToHash.signature;

    // Recreate the hash string exactly as Easypaisa requires (sort keys, concatenate, etc.)
    const keys = Object.keys(dataToHash).sort();
    const dataString = keys.map(k => `${k}=${dataToHash[k]}`).join('&');

    // Encrypt or hash using your key (same as in createEasyPaisaHash)
    const cipher = crypto.createCipheriv('aes-128-ecb', Buffer.from(process.env.EASYPAISA_HASH_KEY, 'utf8'), null);
    cipher.setAutoPadding(true);
    const encrypted = Buffer.concat([cipher.update(dataString, 'utf8'), cipher.final()]);
    const computedHash = encrypted.toString('base64');

    if (computedHash === receivedHash) {
      // Valid callback, update order payment status
      await orderModel.findByIdAndUpdate(callbackData.orderRefNum, { payment: true, status: 'Paid' });
      return res.status(200).send("Payment verified and order updated");
    } else {
      console.warn("Easypaisa callback hash mismatch!", { receivedHash, computedHash });
      return res.status(400).send("Invalid payment signature");
    }
  } catch (error) {
    console.error("Easypaisa callback error:", error);
    res.status(500).send("Server error");
  }
};

export const jazzcashCallback = async (req, res) => {
  try {
    const callbackData = req.body;

    const receivedHash = callbackData.pp_SecureHash;

    // Create string of params to sign (in exact order and format JazzCash specifies)
    const paramsToSign = 
      callbackData.pp_MerchantID +
      callbackData.pp_Password +
      callbackData.pp_TxnRefNo +
      callbackData.pp_Amount +
      callbackData.pp_TxnCurrency +
      callbackData.pp_TxnDateTime;

    // Compute hash using HMAC SHA256 with your integrity salt
    const computedHash = crypto.createHmac('sha256', process.env.JAZZCASH_INTEGRITY_SALT)
      .update(paramsToSign, 'utf8')
      .digest('hex');

    if (computedHash === receivedHash) {
      // Valid callback - update order status
      await orderModel.findByIdAndUpdate(callbackData.pp_TxnRefNo, { payment: true, status: 'Paid' });
      return res.status(200).send("Payment verified and order updated");
    } else {
      console.warn("JazzCash callback hash mismatch!", { receivedHash, computedHash });
      return res.status(400).send("Invalid payment signature");
    }
  } catch (error) {
    console.error("JazzCash callback error:", error);
    res.status(500).send("Server error");
  }
};