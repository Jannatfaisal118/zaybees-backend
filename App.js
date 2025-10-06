// server.js
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './api/userRoute.js'
import productRouter from './api/productRoute.js'
import cartRouter from './api/cartRoute.js'
import orderRouter from './api/orderRoute.js'
import paymentRouter from "./api/paymentRoute.js";
import reviewRouter from "./api/reviewRoute.js";
import voucherRouter from "./api/voucherRoute.js";
import translateRouter from "./api/translateRoute.js";
import dashboardRouter from "./api/dashboardRoute.js";
import customerRouter from "./api/customerRoute.js";
import settingsRouter from './api/settingsRoute.js';
import path from "path";

// App Config
const app = express()
const port = process.env.PORT || 4000
connectDB();
connectCloudinary();

// middlewares
app.use(express.json())

// ✅ CORS configuration
app.use(cors({
  origin: [
    "https://zaybees.vercel.app",
    "https://zaybees-d8pm-krtssjzu5-jannat-faisals-projects.vercel.app",
    "https://admin-zaybees.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// api endpoints
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.use("/api/payment", paymentRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/voucher", voucherRouter);
app.use("/api/translate", translateRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/customers", customerRouter);
app.use('/api/settings', settingsRouter)

app.get('/', (_req, res) => {
  res.send('API working')
})

app.listen(port, () => console.log('Server started on PORT:', port))
