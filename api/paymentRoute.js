import express from "express";
import { placeEasyPaisaOrder, placeJazzCashOrder  } from "../controllers/orderController.js";

const paymentRouter = express.Router();

paymentRouter.post("/easypaisa", placeEasyPaisaOrder );
paymentRouter.post("/jazzcash", placeJazzCashOrder );

paymentRouter.post("/test", (req, res) => {
  res.json({
    success: true,
    message: "Mock payment processed",
    orderId: "TEST123"
  });
});

export default paymentRouter;
