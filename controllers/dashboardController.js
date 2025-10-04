import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";

// ----- KPIs -----
export const getDashboardKPIs = async (req, res) => {
  try {
    // total sales = sum of finalAmount
    const totalSalesAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$finalAmount" } } },
    ]);

    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments();
    const lowStockItems = await Product.countDocuments({ stock: { $lt: 10 } });

    res.json({
      totalSales: totalSalesAgg[0]?.total || 0,
      totalOrders,
      totalCustomers,
      lowStockItems,
      salesGrowth: "+12% from last month", // placeholder for now
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching KPIs", error: err.message });
  }
};

// ----- Sales Data (Monthly) -----
export const getSalesData = async (req, res) => {
  try {
    const sales = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" }, // use createdAt from timestamps
          sales: { $sum: "$finalAmount" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec",
    ];

    const formatted = sales.map((s) => ({
      month: months[s._id - 1],
      sales: s.sales,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sales data", error: err.message });
  }
};

// ----- Orders by Country -----
export const getOrdersByCountry = async (req, res) => {
  try {
    // country is stored inside address object, e.g. address.country
    const orders = await Order.aggregate([
      { $group: { _id: "$address.country", value: { $sum: 1 } } },
    ]);

    const formatted = orders.map((o) => ({
      name: o._id || "Unknown",
      value: o.value,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Error fetching country orders", error: err.message });
  }
};
