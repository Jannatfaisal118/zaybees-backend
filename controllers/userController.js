import validator from "validator";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import userModel from "../models/userModel.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
}

// Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = createToken(user._id);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for user regsistration
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Enter a strong password (min 8 characters)" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword
    });

    const user = await newUser.save();
    const token = createToken(user._id);

    res.json({ success: true, token });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { email }, // store admin email in token
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/user/profile
export const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("name email phone address");
    res.json(user);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// PUT /api/user/profile
export const updateProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// PUT /api/user/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await userModel.findById(req.user._id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const isMatch = await user.comparePassword(currentPassword); // implement comparePassword in model

    if (!isMatch) return res.status(400).json({ success: false, message: "Current password incorrect" });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Add to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const { productId } = req.params;

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Remove from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const { productId } = req.body;

    user.wishlist = user.wishlist.filter(
  (id) => id && id.toString() !== productId
);

    await user.save();

    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get wishlist
export const getWishlist = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).populate("wishlist");
    res.json(user.wishlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export { loginUser, registerUser, adminLogin };
