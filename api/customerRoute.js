import express from "express";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js"; // your orders model

const router = express.Router();

// Optional: mapping from country names to ISO codes (for Intl.NumberFormat)
const countryMap = {
  USA: "en-US",
  Pakistan: "en-PK",
  UK: "en-GB",
  India: "en-IN",
  // add more countries as needed
};

// helper function
function formatDate(date) {
  if (!date) return "No orders yet";
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

router.get("/", async (req, res) => {
  try {
    const users = await User.find();

    const customers = await Promise.all(
      users.map(async (u) => {
        // get orders for this user
        const orders = await Order.find({ userId: u._id }).sort({ date: -1 }); // latest first
        const totalOrders = orders.length;
        const totalSpend = orders.reduce((sum, o) => sum + o.totalAmount, 0);

        // last order date
        const lastOrder = orders.length ? orders[0].date : null;

        // map country to ISO code or default to "US"
        // map country to ISO code or default to "en-PK"
let country = "en-PK"; // default
if (u.address?.country && countryMap[u.address.country]) {
  country = countryMap[u.address.country];
}


        return {
         _id: u._id,
  name: u.name,
  email: u.email,
  country, // ISO code
  totalOrders,
  totalSpend,
  lastOrder: formatDate(lastOrder), // already formatted string
  status: "Active",
  loyaltyTier: "Bronze",
        };
      })
    );

    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
