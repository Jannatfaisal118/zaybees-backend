import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js"; // make sure path is correct

const authUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, please login again",
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ fetch full user details
    const user = await userModel.findById(decoded.id).select("name email cartData");
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user; // now you have req.user.id and req.user.name
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token, please login again",
    });
  }
};

export default authUser;
