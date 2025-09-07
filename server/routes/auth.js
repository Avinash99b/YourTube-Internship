import express from "express";
import { login, updateprofile, getUserUsage, verifyOtp, resendOtp, getUserByEmail } from "../controllers/auth.js";
import { authenticate } from "../middleware/auth.js";
const routes = express.Router();

routes.post("/login", login);
routes.patch("/update/:id", authenticate, updateprofile);
routes.get("/usage", authenticate, getUserUsage);
routes.post("/verifyOtp", verifyOtp);
routes.post("/resend-otp", resendOtp);
routes.get("/user", getUserByEmail);

export default routes;
