import express from "express";
import { createOrder, handlePaymentSuccess } from "../controllers/payment.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/create-order", authenticate, createOrder); // Initiate Razorpay order
router.post("/payment-success", authenticate, handlePaymentSuccess); // Handle payment success and upgrade plan

export default router;
