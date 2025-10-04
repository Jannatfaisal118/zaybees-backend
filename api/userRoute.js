import express from "express";
import {
  loginUser,
  registerUser,
  adminLogin,
  getProfile,
  updateProfile,
  changePassword,
  addToWishlist,
  removeFromWishlist,
  getWishlist
} from "../controllers/userController.js";
import authUser from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);

// Protected routes
userRouter.get("/profile", authUser, getProfile);
userRouter.put("/profile", authUser, updateProfile);
userRouter.put("/change-password", authUser, changePassword);

// Protected routes
userRouter.get("/wishlist", authUser, getWishlist);
userRouter.post("/wishlist/add/:productId", authUser, addToWishlist);
userRouter.post("/wishlist/remove", authUser, removeFromWishlist);

export default userRouter;
