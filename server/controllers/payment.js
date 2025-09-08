import Razorpay from "razorpay";
import users from "../Modals/Auth.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const PLAN_DETAILS = {
  bronze: { amount: 10, duration: 30, watchLimit: 7 },
  silver: { amount: 50, duration: 30, watchLimit: 10 },
  gold: { amount: 100, duration: 30, watchLimit: null },
};

export const createOrder = async (req, res) => {
  const { plan } = req.body;
  if (!PLAN_DETAILS[plan]) return res.status(400).json({ message: "Invalid plan" });
  try {
    const options = {
      amount: PLAN_DETAILS[plan].amount * 100, // in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.status(200).json({ order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating order" });
  }
};

export const handlePaymentSuccess = async (req, res) => {
  const { userId, plan, paymentId } = req.body;
  if (!PLAN_DETAILS[plan]) return res.status(400).json({ message: "Invalid plan" });
  try {
    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.plan = plan;
    user.planExpiry = new Date(Date.now() + PLAN_DETAILS[plan].duration * 24 * 60 * 60 * 1000);
    await user.save();
    // Send invoice email
    await sendInvoiceEmail(user.email, plan, PLAN_DETAILS[plan].amount, paymentId);
    res.status(200).json({ message: "Plan upgraded and invoice sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error handling payment" });
  }
};

async function sendInvoiceEmail(email, plan, amount, paymentId) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: false, // use TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Invoice for ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Upgrade`,
    text: `Thank you for upgrading to the ${plan} plan.\n\nAmount: ₹${amount}\nPayment ID: ${paymentId}\n\nEnjoy your new benefits!`,
  };
  await transporter.sendMail(mailOptions);
}
